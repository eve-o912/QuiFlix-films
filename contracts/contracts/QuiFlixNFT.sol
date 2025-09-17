// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title QuiFlixNFT
 * @dev NFT Ticket Contract for QuiFlix films with EIP-2981 royalty support
 */
contract QuiFlixNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard, IERC2981 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Struct to store film metadata
    struct FilmMetadata {
        string title;
        string description;
        string genre;
        uint256 duration; // in seconds
        uint256 releaseDate;
        address producer;
        string ipfsHash;
        uint256 price; // in wei
        bool isActive;
    }
    
    // Mapping from token ID to film metadata
    mapping(uint256 => FilmMetadata) public films;
    
    // Mapping from producer to their films
    mapping(address => uint256[]) public producerFilms;
    
    // Royalty information
    uint256 public constant ROYALTY_BASIS_POINTS = 250; // 2.5%
    address public royaltyRecipient;
    
    // Platform fee
    uint256 public constant PLATFORM_FEE_BASIS_POINTS = 100; // 1%
    address public platformFeeRecipient;
    
    // Events
    event FilmCreated(uint256 indexed tokenId, address indexed producer, string title, uint256 price);
    event FilmPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event FilmResold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    
    constructor(
        address _royaltyRecipient,
        address _platformFeeRecipient
    ) ERC721("QuiFlix Film Ticket", "QFT") {
        royaltyRecipient = _royaltyRecipient;
        platformFeeRecipient = _platformFeeRecipient;
    }
    
    /**
     * @dev Create a new film NFT
     * @param _title Film title
     * @param _description Film description
     * @param _genre Film genre
     * @param _duration Film duration in seconds
     * @param _releaseDate Film release date
     * @param _ipfsHash IPFS hash of the film content
     * @param _price Price in wei
     * @param _tokenURI Metadata URI
     */
    function createFilm(
        string memory _title,
        string memory _description,
        string memory _genre,
        uint256 _duration,
        uint256 _releaseDate,
        string memory _ipfsHash,
        uint256 _price,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        films[tokenId] = FilmMetadata({
            title: _title,
            description: _description,
            genre: _genre,
            duration: _duration,
            releaseDate: _releaseDate,
            producer: msg.sender,
            ipfsHash: _ipfsHash,
            price: _price,
            isActive: true
        });
        
        producerFilms[msg.sender].push(tokenId);
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        emit FilmCreated(tokenId, msg.sender, _title, _price);
        
        return tokenId;
    }
    
    /**
     * @dev Purchase a film NFT
     * @param _tokenId Token ID of the film
     */
    function purchaseFilm(uint256 _tokenId) external payable nonReentrant {
        require(_exists(_tokenId), "Film does not exist");
        require(films[_tokenId].isActive, "Film is not active");
        require(msg.value >= films[_tokenId].price, "Insufficient payment");
        
        address producer = films[_tokenId].producer;
        uint256 price = films[_tokenId].price;
        
        // Calculate fees
        uint256 platformFee = (price * PLATFORM_FEE_BASIS_POINTS) / 10000;
        uint256 producerPayment = price - platformFee;
        
        // Transfer NFT to buyer
        _transfer(ownerOf(_tokenId), msg.sender, _tokenId);
        
        // Distribute payments
        if (platformFee > 0) {
            payable(platformFeeRecipient).transfer(platformFee);
        }
        if (producerPayment > 0) {
            payable(producer).transfer(producerPayment);
        }
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit FilmPurchased(_tokenId, msg.sender, price);
    }
    
    /**
     * @dev Resell a film NFT
     * @param _tokenId Token ID of the film
     * @param _newPrice New price for the film
     */
    function resellFilm(uint256 _tokenId, uint256 _newPrice) external {
        require(_exists(_tokenId), "Film does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_newPrice > 0, "Price must be greater than 0");
        
        films[_tokenId].price = _newPrice;
        
        emit FilmResold(_tokenId, msg.sender, address(0), _newPrice);
    }
    
    /**
     * @dev Get film metadata
     * @param _tokenId Token ID
     */
    function getFilmMetadata(uint256 _tokenId) external view returns (FilmMetadata memory) {
        require(_exists(_tokenId), "Film does not exist");
        return films[_tokenId];
    }
    
    /**
     * @dev Get films by producer
     * @param _producer Producer address
     */
    function getProducerFilms(address _producer) external view returns (uint256[] memory) {
        return producerFilms[_producer];
    }
    
    /**
     * @dev EIP-2981 royalty info
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view override returns (address, uint256) {
        require(_exists(_tokenId), "Token does not exist");
        uint256 royaltyAmount = (_salePrice * ROYALTY_BASIS_POINTS) / 10000;
        return (royaltyRecipient, royaltyAmount);
    }
    
    /**
     * @dev Update royalty recipient
     */
    function updateRoyaltyRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        royaltyRecipient = _newRecipient;
    }
    
    /**
     * @dev Update platform fee recipient
     */
    function updatePlatformFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        platformFeeRecipient = _newRecipient;
    }
    
    /**
     * @dev Deactivate a film
     */
    function deactivateFilm(uint256 _tokenId) external onlyOwner {
        require(_exists(_tokenId), "Film does not exist");
        films[_tokenId].isActive = false;
    }
    
    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}
