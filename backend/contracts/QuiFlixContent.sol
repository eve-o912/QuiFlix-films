// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title QuiFlixContent
 * @dev Content Contract for managing film payments and royalties with USDC/USDT
 * @notice Stablecoin version - supports USDC and USDT payments
 */
contract QuiFlixContent is Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    using SafeERC20 for IERC20;
    
    uint256 private _contentIdCounter;

    IERC20 public immutable USDC;
    IERC20 public immutable USDT;

    enum PaymentToken {
        USDC,
        USDT
    }
    
    // Struct to store content information
    struct Content {
        uint256 contentId;
        string title;
        string ipfsHash;
        address producer;
        uint256 totalRevenueUSDC;
        uint256 totalRevenueUSDT;
        uint256 totalViews;
        bool isActive;
        uint256 createdAt;
    }
    
    // Struct for payment splits (only percentages, no specific addresses)
    struct PaymentSplit {
        uint256 producerPercentage; // in basis points (10000 = 100%)
        uint256 platformPercentage; // in basis points
    }
    
    // Mapping from content ID to content
    mapping(uint256 => Content) public contents;
    
    // Mapping from producer to their content
    mapping(address => uint256[]) public producerContent;
    
    // Pending withdrawals for producers (pull pattern) - separate for each token
    mapping(address => uint256) public pendingWithdrawalsUSDC;
    mapping(address => uint256) public pendingWithdrawalsUSDT;
    
    // Pending withdrawals for platform
    uint256 public platformPendingWithdrawalUSDC;
    uint256 public platformPendingWithdrawalUSDT;
    
    // Payment split configuration
    PaymentSplit public paymentSplit;
    
    // Platform address
    address public platformAddress;
    
    // View validator address (for signed view recording)
    address public viewValidator;
    
    // Nonces for view recording to prevent replay attacks
    mapping(address => mapping(uint256 => bool)) public usedViewNonces;
    
    // Minimum payment amount to prevent dust attacks (in token's smallest unit)
    uint256 public constant MIN_PAYMENT = 1000; // 0.001 USDC/USDT (6 decimals)
    
    // IPFS hash length validation
    uint256 public constant MIN_IPFS_HASH_LENGTH = 46;
    
    // Events
    event ContentCreated(
        uint256 indexed contentId, 
        address indexed producer, 
        string title, 
        string ipfsHash,
        uint256 timestamp
    );
    event ContentUpdated(
        uint256 indexed contentId,
        string newTitle,
        string newIpfsHash,
        uint256 timestamp
    );
    event RevenueDistributed(
        uint256 indexed contentId, 
        address indexed producer, 
        uint256 producerAmount, 
        uint256 platformAmount,
        PaymentToken token,
        uint256 timestamp
    );
    event ViewRecorded(
        uint256 indexed contentId, 
        address indexed viewer,
        uint256 timestamp
    );
    event PaymentSplitUpdated(
        uint256 producerPercentage, 
        uint256 platformPercentage,
        uint256 timestamp
    );
    event ProducerWithdrawal(
        address indexed producer,
        uint256 amount,
        PaymentToken token,
        uint256 timestamp
    );
    event PlatformWithdrawal(
        address indexed platform,
        uint256 amount,
        PaymentToken token,
        uint256 timestamp
    );
    event ContentDeactivated(
        uint256 indexed contentId,
        uint256 timestamp
    );
    event ContentReactivated(
        uint256 indexed contentId,
        uint256 timestamp
    );
    event PlatformAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress,
        uint256 timestamp
    );
    event ViewValidatorUpdated(
        address indexed oldValidator,
        address indexed newValidator,
        uint256 timestamp
    );
    
    constructor(
        uint256 _producerPercentage,
        uint256 _platformPercentage,
        address _platformAddress,
        address _viewValidator,
        address _usdcAddress,
        address _usdtAddress
    ) Ownable(msg.sender) {
        require(_platformAddress != address(0), "Invalid platform address");
        require(_viewValidator != address(0), "Invalid validator address");
        require(_usdcAddress != address(0), "Invalid USDC address");
        require(_usdtAddress != address(0), "Invalid USDT address");
        require(
            _producerPercentage + _platformPercentage == 10000, 
            "Percentages must sum to 100%"
        );
        require(_producerPercentage > 0, "Producer percentage must be > 0");
        require(_platformPercentage > 0, "Platform percentage must be > 0");
        
        paymentSplit = PaymentSplit({
            producerPercentage: _producerPercentage,
            platformPercentage: _platformPercentage
        });
        
        platformAddress = _platformAddress;
        viewValidator = _viewValidator;
        USDC = IERC20(_usdcAddress);
        USDT = IERC20(_usdtAddress);
    }
    
    /**
     * @dev Create new content
     * @param _title Content title
     * @param _ipfsHash IPFS hash of the content
     */
    function createContent(
        string memory _title,
        string memory _ipfsHash
    ) external whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_ipfsHash).length >= MIN_IPFS_HASH_LENGTH, "Invalid IPFS hash");
        require(msg.sender != address(0), "Invalid producer address");
        
        uint256 contentId = _contentIdCounter;
        _contentIdCounter++;
        
        contents[contentId] = Content({
            contentId: contentId,
            title: _title,
            ipfsHash: _ipfsHash,
            producer: msg.sender,
            totalRevenueUSDC: 0,
            totalRevenueUSDT: 0,
            totalViews: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        producerContent[msg.sender].push(contentId);
        
        emit ContentCreated(contentId, msg.sender, _title, _ipfsHash, block.timestamp);
        
        return contentId;
    }
    
    /**
     * @dev Update existing content (only by producer)
     * @param _contentId Content ID
     * @param _newTitle New title
     * @param _newIpfsHash New IPFS hash
     */
    function updateContent(
        uint256 _contentId,
        string memory _newTitle,
        string memory _newIpfsHash
    ) external whenNotPaused {
        require(_contentId < _contentIdCounter, "Content does not exist");
        require(bytes(_newTitle).length > 0, "Title cannot be empty");
        require(bytes(_newIpfsHash).length >= MIN_IPFS_HASH_LENGTH, "Invalid IPFS hash");
        
        Content storage content = contents[_contentId];
        require(content.producer == msg.sender, "Only producer can update content");
        
        content.title = _newTitle;
        content.ipfsHash = _newIpfsHash;
        
        emit ContentUpdated(_contentId, _newTitle, _newIpfsHash, block.timestamp);
    }
    
    /**
     * @dev Record a view for content with signature validation
     * @param _contentId Content ID
     * @param _nonce Unique nonce to prevent replay attacks
     * @param _signature Signature from view validator
     */
    function recordView(
        uint256 _contentId,
        uint256 _nonce,
        bytes memory _signature
    ) external whenNotPaused {
        require(_contentId < _contentIdCounter, "Content does not exist");
        require(contents[_contentId].isActive, "Content is not active");
        require(!usedViewNonces[msg.sender][_nonce], "Nonce already used");
        
        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(_contentId, msg.sender, _nonce)
        );
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(_signature);
        
        require(signer == viewValidator, "Invalid signature");
        
        // Mark nonce as used
        usedViewNonces[msg.sender][_nonce] = true;
        
        // Record view
        contents[_contentId].totalViews++;
        
        emit ViewRecorded(_contentId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Direct sell film with USDC (90% producer, 10% platform)
     * @notice User purchases direct access to film without NFT
     * @param _contentId Content ID
     * @param _amount Payment amount in USDC
     */
    function directSellUSDC(uint256 _contentId, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        _directSell(_contentId, _amount, PaymentToken.USDC);
    }

    /**
     * @dev Direct sell film with USDT (90% producer, 10% platform)
     * @notice User purchases direct access to film without NFT
     * @param _contentId Content ID
     * @param _amount Payment amount in USDT
     */
    function directSellUSDT(uint256 _contentId, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        _directSell(_contentId, _amount, PaymentToken.USDT);
    }

    /**
     * @dev Distribute revenue for content with USDC (pull pattern)
     * @param _contentId Content ID
     * @param _amount Amount in USDC (with 6 decimals)
     */
    function distributeRevenueUSDC(uint256 _contentId, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        _distributeRevenue(_contentId, _amount, PaymentToken.USDC);
    }

    /**
     * @dev Distribute revenue for content with USDT (pull pattern)
     * @param _contentId Content ID
     * @param _amount Amount in USDT (with 6 decimals)
     */
    function distributeRevenueUSDT(uint256 _contentId, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        _distributeRevenue(_contentId, _amount, PaymentToken.USDT);
    }

    /**
     * @dev Internal function for direct sell (no NFT)
     * @notice Applies 90/10 split: Producer/Platform
     */
    function _directSell(
        uint256 _contentId,
        uint256 _amount,
        PaymentToken _token
    ) internal {
        require(_contentId < _contentIdCounter, "Content does not exist");
        require(_amount >= MIN_PAYMENT, "Payment below minimum");
        
        Content storage content = contents[_contentId];
        require(content.isActive, "Content is not active");
        
        // Fixed 90/10 split for direct sells
        uint256 producerAmount = (_amount * 9000) / 10000; // 90%
        uint256 platformAmount = _amount - producerAmount;  // 10%
        
        // Transfer tokens from buyer to contract
        IERC20 token = (_token == PaymentToken.USDC) ? USDC : USDT;
        token.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Update revenue tracking
        if (_token == PaymentToken.USDC) {
            content.totalRevenueUSDC += _amount;
            pendingWithdrawalsUSDC[content.producer] += producerAmount;
            platformPendingWithdrawalUSDC += platformAmount;
        } else {
            content.totalRevenueUSDT += _amount;
            pendingWithdrawalsUSDT[content.producer] += producerAmount;
            platformPendingWithdrawalUSDT += platformAmount;
        }
        
        emit RevenueDistributed(
            _contentId, 
            content.producer, 
            producerAmount, 
            platformAmount,
            _token,
            block.timestamp
        );
    }

    /**
     * @dev Internal function to distribute revenue
     */
    function _distributeRevenue(
        uint256 _contentId,
        uint256 _amount,
        PaymentToken _token
    ) internal {
        require(_contentId < _contentIdCounter, "Content does not exist");
        require(_amount >= MIN_PAYMENT, "Payment below minimum");
        
        Content storage content = contents[_contentId];
        require(content.isActive, "Content is not active");
        
        // Calculate splits (90% Producer, 10% Platform by default)
        uint256 producerAmount = (_amount * paymentSplit.producerPercentage) / 10000;
        uint256 platformAmount = _amount - producerAmount;
        
        // Transfer tokens from sender to contract
        IERC20 token = (_token == PaymentToken.USDC) ? USDC : USDT;
        token.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Update total revenue
        if (_token == PaymentToken.USDC) {
            content.totalRevenueUSDC += _amount;
            pendingWithdrawalsUSDC[content.producer] += producerAmount;
            platformPendingWithdrawalUSDC += platformAmount;
        } else {
            content.totalRevenueUSDT += _amount;
            pendingWithdrawalsUSDT[content.producer] += producerAmount;
            platformPendingWithdrawalUSDT += platformAmount;
        }
        
        emit RevenueDistributed(
            _contentId, 
            content.producer, 
            producerAmount, 
            platformAmount,
            _token,
            block.timestamp
        );
    }
    
    /**
     * @dev Producer withdraws their pending USDC revenue
     */
    function withdrawProducerRevenueUSDC() external nonReentrant {
        uint256 amount = pendingWithdrawalsUSDC[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawalsUSDC[msg.sender] = 0;
        USDC.safeTransfer(msg.sender, amount);
        
        emit ProducerWithdrawal(msg.sender, amount, PaymentToken.USDC, block.timestamp);
    }

    /**
     * @dev Producer withdraws their pending USDT revenue
     */
    function withdrawProducerRevenueUSDT() external nonReentrant {
        uint256 amount = pendingWithdrawalsUSDT[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawalsUSDT[msg.sender] = 0;
        USDT.safeTransfer(msg.sender, amount);
        
        emit ProducerWithdrawal(msg.sender, amount, PaymentToken.USDT, block.timestamp);
    }
    
    /**
     * @dev Platform withdraws their pending USDC revenue
     */
    function withdrawPlatformRevenueUSDC() external nonReentrant {
        require(msg.sender == platformAddress || msg.sender == owner(), "Not authorized");
        uint256 amount = platformPendingWithdrawalUSDC;
        require(amount > 0, "No funds to withdraw");
        
        platformPendingWithdrawalUSDC = 0;
        USDC.safeTransfer(platformAddress, amount);
        
        emit PlatformWithdrawal(platformAddress, amount, PaymentToken.USDC, block.timestamp);
    }

    /**
     * @dev Platform withdraws their pending USDT revenue
     */
    function withdrawPlatformRevenueUSDT() external nonReentrant {
        require(msg.sender == platformAddress || msg.sender == owner(), "Not authorized");
        uint256 amount = platformPendingWithdrawalUSDT;
        require(amount > 0, "No funds to withdraw");
        
        platformPendingWithdrawalUSDT = 0;
        USDT.safeTransfer(platformAddress, amount);
        
        emit PlatformWithdrawal(platformAddress, amount, PaymentToken.USDT, block.timestamp);
    }
    
    /**
     * @dev Get content information
     * @param _contentId Content ID
     */
    function getContent(uint256 _contentId) external view returns (Content memory) {
        require(_contentId < _contentIdCounter, "Content does not exist");
        return contents[_contentId];
    }
    
    /**
     * @dev Get producer's content
     * @param _producer Producer address
     */
    function getProducerContent(address _producer) external view returns (uint256[] memory) {
        return producerContent[_producer];
    }
    
    /**
     * @dev Get total content count
     */
    function getTotalContentCount() external view returns (uint256) {
        return _contentIdCounter;
    }
    
    /**
     * @dev Get producer pending withdrawals (both tokens)
     * @param _producer Producer address
     */
    function getProducerPendingWithdrawals(address _producer) 
        external 
        view 
        returns (uint256 usdcAmount, uint256 usdtAmount) 
    {
        return (pendingWithdrawalsUSDC[_producer], pendingWithdrawalsUSDT[_producer]);
    }
    
    /**
     * @dev Update payment split (only owner)
     * @param _producerPercentage New producer percentage
     * @param _platformPercentage New platform percentage
     */
    function updatePaymentSplit(
        uint256 _producerPercentage,
        uint256 _platformPercentage
    ) external onlyOwner {
        require(
            _producerPercentage + _platformPercentage == 10000, 
            "Percentages must sum to 100%"
        );
        require(_producerPercentage > 0, "Producer percentage must be > 0");
        require(_platformPercentage > 0, "Platform percentage must be > 0");
        
        paymentSplit.producerPercentage = _producerPercentage;
        paymentSplit.platformPercentage = _platformPercentage;
        
        emit PaymentSplitUpdated(_producerPercentage, _platformPercentage, block.timestamp);
    }
    
    /**
     * @dev Update platform address
     * @param _newPlatform New platform address
     */
    function updatePlatformAddress(address _newPlatform) external onlyOwner {
        require(_newPlatform != address(0), "Invalid platform address");
        address oldPlatform = platformAddress;
        platformAddress = _newPlatform;
        
        emit PlatformAddressUpdated(oldPlatform, _newPlatform, block.timestamp);
    }
    
    /**
     * @dev Update view validator address
     * @param _newValidator New validator address
     */
    function updateViewValidator(address _newValidator) external onlyOwner {
        require(_newValidator != address(0), "Invalid validator address");
        address oldValidator = viewValidator;
        viewValidator = _newValidator;
        
        emit ViewValidatorUpdated(oldValidator, _newValidator, block.timestamp);
    }
    
    /**
     * @dev Deactivate content (only owner or producer)
     * @param _contentId Content ID
     */
    function deactivateContent(uint256 _contentId) external {
        require(_contentId < _contentIdCounter, "Content does not exist");
        Content storage content = contents[_contentId];
        require(
            msg.sender == owner() || msg.sender == content.producer,
            "Not authorized"
        );
        require(content.isActive, "Content already inactive");
        
        content.isActive = false;
        
        emit ContentDeactivated(_contentId, block.timestamp);
    }
    
    /**
     * @dev Reactivate content (only owner or producer)
     * @param _contentId Content ID
     */
    function reactivateContent(uint256 _contentId) external {
        require(_contentId < _contentIdCounter, "Content does not exist");
        Content storage content = contents[_contentId];
        require(
            msg.sender == owner() || msg.sender == content.producer,
            "Not authorized"
        );
        require(!content.isActive, "Content already active");
        
        content.isActive = true;
        
        emit ContentReactivated(_contentId, block.timestamp);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}