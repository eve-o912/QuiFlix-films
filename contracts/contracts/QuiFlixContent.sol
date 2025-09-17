// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title QuiFlixContent
 * @dev Content Contract for managing film payments and royalties
 */
contract QuiFlixContent is Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _contentIdCounter;
    
    // Struct to store content information
    struct Content {
        uint256 contentId;
        string title;
        string ipfsHash;
        address producer;
        uint256 totalRevenue;
        uint256 totalViews;
        bool isActive;
        uint256 createdAt;
    }
    
    // Struct for payment splits
    struct PaymentSplit {
        address producer;
        uint256 producerPercentage; // in basis points (10000 = 100%)
        address platform;
        uint256 platformPercentage; // in basis points
    }
    
    // Mapping from content ID to content
    mapping(uint256 => Content) public contents;
    
    // Mapping from producer to their content
    mapping(address => uint256[]) public producerContent;
    
    // Payment split configuration
    PaymentSplit public paymentSplit;
    
    // Events
    event ContentCreated(uint256 indexed contentId, address indexed producer, string title, string ipfsHash);
    event RevenueDistributed(uint256 indexed contentId, address indexed producer, uint256 producerAmount, uint256 platformAmount);
    event ViewRecorded(uint256 indexed contentId, address indexed viewer);
    event PaymentSplitUpdated(uint256 producerPercentage, uint256 platformPercentage);
    
    constructor(
        address _producer,
        uint256 _producerPercentage,
        address _platform,
        uint256 _platformPercentage
    ) {
        require(_producer != address(0), "Invalid producer address");
        require(_platform != address(0), "Invalid platform address");
        require(_producerPercentage + _platformPercentage == 10000, "Percentages must sum to 100%");
        
        paymentSplit = PaymentSplit({
            producer: _producer,
            producerPercentage: _producerPercentage,
            platform: _platform,
            platformPercentage: _platformPercentage
        });
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
        uint256 contentId = _contentIdCounter.current();
        _contentIdCounter.increment();
        
        contents[contentId] = Content({
            contentId: contentId,
            title: _title,
            ipfsHash: _ipfsHash,
            producer: msg.sender,
            totalRevenue: 0,
            totalViews: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        producerContent[msg.sender].push(contentId);
        
        emit ContentCreated(contentId, msg.sender, _title, _ipfsHash);
        
        return contentId;
    }
    
    /**
     * @dev Record a view for content
     * @param _contentId Content ID
     */
    function recordView(uint256 _contentId) external {
        require(_contentId < _contentIdCounter.current(), "Content does not exist");
        require(contents[_contentId].isActive, "Content is not active");
        
        contents[_contentId].totalViews++;
        
        emit ViewRecorded(_contentId, msg.sender);
    }
    
    /**
     * @dev Distribute revenue for content
     * @param _contentId Content ID
     */
    function distributeRevenue(uint256 _contentId) external payable nonReentrant {
        require(_contentId < _contentIdCounter.current(), "Content does not exist");
        require(msg.value > 0, "No payment received");
        
        Content storage content = contents[_contentId];
        require(content.isActive, "Content is not active");
        
        // Calculate splits
        uint256 producerAmount = (msg.value * paymentSplit.producerPercentage) / 10000;
        uint256 platformAmount = msg.value - producerAmount;
        
        // Update total revenue
        content.totalRevenue += msg.value;
        
        // Distribute payments
        if (producerAmount > 0) {
            payable(paymentSplit.producer).transfer(producerAmount);
        }
        if (platformAmount > 0) {
            payable(paymentSplit.platform).transfer(platformAmount);
        }
        
        emit RevenueDistributed(_contentId, paymentSplit.producer, producerAmount, platformAmount);
    }
    
    /**
     * @dev Get content information
     * @param _contentId Content ID
     */
    function getContent(uint256 _contentId) external view returns (Content memory) {
        require(_contentId < _contentIdCounter.current(), "Content does not exist");
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
     * @dev Update payment split (only owner)
     * @param _producerPercentage New producer percentage
     * @param _platformPercentage New platform percentage
     */
    function updatePaymentSplit(
        uint256 _producerPercentage,
        uint256 _platformPercentage
    ) external onlyOwner {
        require(_producerPercentage + _platformPercentage == 10000, "Percentages must sum to 100%");
        
        paymentSplit.producerPercentage = _producerPercentage;
        paymentSplit.platformPercentage = _platformPercentage;
        
        emit PaymentSplitUpdated(_producerPercentage, _platformPercentage);
    }
    
    /**
     * @dev Update producer address
     * @param _newProducer New producer address
     */
    function updateProducer(address _newProducer) external onlyOwner {
        require(_newProducer != address(0), "Invalid producer address");
        paymentSplit.producer = _newProducer;
    }
    
    /**
     * @dev Update platform address
     * @param _newPlatform New platform address
     */
    function updatePlatform(address _newPlatform) external onlyOwner {
        require(_newPlatform != address(0), "Invalid platform address");
        paymentSplit.platform = _newPlatform;
    }
    
    /**
     * @dev Deactivate content
     * @param _contentId Content ID
     */
    function deactivateContent(uint256 _contentId) external onlyOwner {
        require(_contentId < _contentIdCounter.current(), "Content does not exist");
        contents[_contentId].isActive = false;
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
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
