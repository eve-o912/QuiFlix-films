// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * QuiFlixNFT (stablecoin-only)
 * - OpenZeppelin v5.x compatible
 * - Payments: USDC, USDT (stablecoins)
 * - Primary sale: Platform 10% / Producer 90%
 * - Secondary sale: Seller 85% / Platform 5% / Producer 10% (royalty)
 */
contract QuiFlixNFT is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    ReentrancyGuard,
    IERC2981
{
    using SafeERC20 for IERC20;

    uint256 private _nextTokenId;

    IERC20 public immutable USDC;
    IERC20 public immutable USDT;

    enum PaymentToken {
        USDC,
        USDT
    }

    struct FilmMetadata {
        string title;
        string description;
        string genre;
        uint256 duration;
        uint256 releaseDate;
        address producer;
        string ipfsHash;
        uint256 price;
        bool isActive;
    }

    struct Listing {
        address seller;
        uint256 price;
        PaymentToken[] acceptedTokens;
        bool isListed;
    }

    mapping(uint256 => FilmMetadata) public films;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public producerFilms;
    mapping(uint256 => bool) public hasBeenSoldBefore;

    uint256 public constant PRIMARY_PLATFORM_FEE_BASIS_POINTS = 1000;
    uint256 public constant SECONDARY_PLATFORM_FEE_BASIS_POINTS = 500;
    uint256 public constant SECONDARY_PRODUCER_FEE_BASIS_POINTS = 1000;
    uint256 public constant SECONDARY_SELLER_SHARE_BASIS_POINTS = 8500;

    address public platformFeeRecipient;

    event FilmCreated(uint256 indexed tokenId, address indexed producer, string title, uint256 price);
    event FilmListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event FilmUnlisted(uint256 indexed tokenId, address indexed seller);
    event FilmPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        PaymentToken paymentToken,
        bool isPrimarySale
    );
    event RoyaltyPaid(uint256 indexed tokenId, address indexed producer, uint256 amount, PaymentToken paymentToken);
    event FilmDeactivated(uint256 indexed tokenId);
    event PlatformFeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    constructor(
        address _initialOwner,
        address _platformFeeRecipient,
        address _usdcAddress,
        address _usdtAddress
    ) ERC721("QuiFlix Film Ticket", "QFT") Ownable(_initialOwner) {
        require(_initialOwner != address(0), "Invalid owner");
        require(_platformFeeRecipient != address(0), "Invalid platform recipient");
        require(_usdcAddress != address(0), "Invalid USDC address");
        require(_usdtAddress != address(0), "Invalid USDT address");

        platformFeeRecipient = _platformFeeRecipient;
        USDC = IERC20(_usdcAddress);
        USDT = IERC20(_usdtAddress);
    }

    function createFilm(
        address _producer,
        string memory _title,
        string memory _description,
        string memory _genre,
        uint256 _duration,
        uint256 _releaseDate,
        string memory _ipfsHash,
        uint256 _price,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        require(_producer != address(0), "Invalid producer");
        require(_price > 0, "Invalid price");
        require(bytes(_title).length > 0, "Empty title");
        require(bytes(_ipfsHash).length > 0, "Empty IPFS hash");

        uint256 tokenId = _nextTokenId++;
        films[tokenId] = FilmMetadata({
            title: _title,
            description: _description,
            genre: _genre,
            duration: _duration,
            releaseDate: _releaseDate,
            producer: _producer,
            ipfsHash: _ipfsHash,
            price: _price,
            isActive: true
        });

        producerFilms[_producer].push(tokenId);
        _safeMint(_producer, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit FilmCreated(tokenId, _producer, _title, _price);
        return tokenId;
    }

    function listFilm(
        uint256 _tokenId,
        uint256 _price,
        PaymentToken[] memory _acceptedTokens
    ) external {
        require(ownerOf(_tokenId) == msg.sender, "Not owner");
        require(_price > 0, "Invalid price");
        require(_acceptedTokens.length > 0, "No tokens accepted");
        require(films[_tokenId].isActive, "Film inactive");

        listings[_tokenId] = Listing({
            seller: msg.sender,
            price: _price,
            acceptedTokens: _acceptedTokens,
            isListed: true
        });

        emit FilmListed(_tokenId, msg.sender, _price);
    }

    function unlistFilm(uint256 _tokenId) external {
        require(listings[_tokenId].seller == msg.sender, "Not seller");
        require(listings[_tokenId].isListed, "Not listed");

        listings[_tokenId].isListed = false;
        emit FilmUnlisted(_tokenId, msg.sender);
    }

    function purchaseFilmWithUSDC(uint256 _tokenId) external nonReentrant {
        _purchaseFilm(_tokenId, PaymentToken.USDC);
    }

    function purchaseFilmWithUSDT(uint256 _tokenId) external nonReentrant {
        _purchaseFilm(_tokenId, PaymentToken.USDT);
    }

    function _purchaseFilm(uint256 _tokenId, PaymentToken _paymentToken) internal {
        Listing memory listing = listings[_tokenId];
        require(listing.isListed, "Not listed");
        require(_isTokenAccepted(_tokenId, _paymentToken), "Payment not accepted");

        address seller = listing.seller;
        address producer = films[_tokenId].producer;
        uint256 price = listing.price;
        bool isPrimary = (seller == producer && !hasBeenSoldBefore[_tokenId]);

        uint256 platformFee;
        uint256 producerShare;
        uint256 sellerShare;

        if (isPrimary) {
            platformFee = (price * PRIMARY_PLATFORM_FEE_BASIS_POINTS) / 10000;
            sellerShare = price - platformFee;
            hasBeenSoldBefore[_tokenId] = true;
        } else {
            platformFee = (price * SECONDARY_PLATFORM_FEE_BASIS_POINTS) / 10000;
            producerShare = (price * SECONDARY_PRODUCER_FEE_BASIS_POINTS) / 10000;
            sellerShare = price - platformFee - producerShare;
        }

        listings[_tokenId].isListed = false;
        _transfer(seller, msg.sender, _tokenId);

        IERC20 token = (_paymentToken == PaymentToken.USDC) ? USDC : USDT;
        _handleTokenPayments(token, seller, producer, platformFee, producerShare, sellerShare);

        emit FilmPurchased(_tokenId, msg.sender, seller, price, _paymentToken, isPrimary);

        if (!isPrimary && producerShare > 0) {
            emit RoyaltyPaid(_tokenId, producer, producerShare, _paymentToken);
        }
    }

    function _handleTokenPayments(
        IERC20 token,
        address seller,
        address producer,
        uint256 platformFee,
        uint256 producerShare,
        uint256 sellerShare
    ) internal {
        uint256 total = platformFee + producerShare + sellerShare;
        token.safeTransferFrom(msg.sender, address(this), total);
        if (platformFee > 0) token.safeTransfer(platformFeeRecipient, platformFee);
        if (producerShare > 0) token.safeTransfer(producer, producerShare);
        if (sellerShare > 0) token.safeTransfer(seller, sellerShare);
    }

    function _isTokenAccepted(uint256 _tokenId, PaymentToken _token) internal view returns (bool) {
        PaymentToken[] memory accepted = listings[_tokenId].acceptedTokens;
        for (uint256 i = 0; i < accepted.length; i++) {
            if (accepted[i] == _token) return true;
        }
        return false;
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(films[tokenId].producer != address(0), "Token does not exist");

        if (!hasBeenSoldBefore[tokenId]) {
            return (films[tokenId].producer, 0);
        }

        uint256 royalty = (salePrice * SECONDARY_PRODUCER_FEE_BASIS_POINTS) / 10000;
        return (films[tokenId].producer, royalty);
    }

    function updatePlatformFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Zero address");
        address old = platformFeeRecipient;
        platformFeeRecipient = _newRecipient;
        emit PlatformFeeRecipientUpdated(old, _newRecipient);
    }

    function deactivateFilm(uint256 _tokenId) external onlyOwner {
        require(films[_tokenId].isActive, "Already inactive");
        films[_tokenId].isActive = false;
        if (listings[_tokenId].isListed) listings[_tokenId].isListed = false;
        emit FilmDeactivated(_tokenId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address previousOwner = super._update(to, tokenId, auth);
        
        if (to == address(0) && listings[tokenId].isListed) {
            delete listings[tokenId];
        }
        
        return previousOwner;
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, IERC165, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}