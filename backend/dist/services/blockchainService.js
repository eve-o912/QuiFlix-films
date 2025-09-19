"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class BlockchainService {
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        this.wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        const nftABI = [
            "function createFilm(string memory _title, string memory _description, string memory _genre, uint256 _duration, uint256 _releaseDate, string memory _ipfsHash, uint256 _price, string memory _tokenURI) external returns (uint256)",
            "function purchaseFilm(uint256 _tokenId) external payable",
            "function ownerOf(uint256 tokenId) external view returns (address)",
            "function getFilmMetadata(uint256 _tokenId) external view returns (tuple(string title, string description, string genre, uint256 duration, uint256 releaseDate, address producer, string ipfsHash, uint256 price, bool isActive))",
            "function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address, uint256)",
            "event FilmCreated(uint256 indexed tokenId, address indexed producer, string title, uint256 price)",
            "event FilmPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price)"
        ];
        const contentABI = [
            "function createContent(string memory _title, string memory _ipfsHash) external returns (uint256)",
            "function recordView(uint256 _contentId) external",
            "function distributeRevenue(uint256 _contentId) external payable",
            "function getContent(uint256 _contentId) external view returns (tuple(uint256 contentId, string title, string ipfsHash, address producer, uint256 totalRevenue, uint256 totalViews, bool isActive, uint256 createdAt))",
            "event ContentCreated(uint256 indexed contentId, address indexed producer, string title, string ipfsHash)",
            "event RevenueDistributed(uint256 indexed contentId, address indexed producer, uint256 producerAmount, uint256 platformAmount)"
        ];
        this.nftContract = new ethers_1.ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, nftABI, this.wallet);
        this.contentContract = new ethers_1.ethers.Contract(process.env.CONTENT_CONTRACT_ADDRESS, contentABI, this.wallet);
    }
    async createFilm(title, description, genre, duration, releaseDate, ipfsHash, price, tokenURI) {
        try {
            const tx = await this.nftContract.createFilm(title, description, genre, duration, releaseDate, ipfsHash, ethers_1.ethers.parseEther(price), tokenURI);
            const receipt = await tx.wait();
            const event = receipt.logs.find((log) => {
                try {
                    const parsed = this.nftContract.interface.parseLog(log);
                    return parsed?.name === 'FilmCreated';
                }
                catch {
                    return false;
                }
            });
            if (!event) {
                throw new Error('FilmCreated event not found');
            }
            const parsedEvent = this.nftContract.interface.parseLog(event);
            const tokenId = Number(parsedEvent.args.tokenId);
            return {
                tokenId,
                txHash: tx.hash
            };
        }
        catch (error) {
            console.error('Error creating film:', error);
            throw new Error('Failed to create film on blockchain');
        }
    }
    async purchaseFilm(tokenId, price) {
        try {
            const tx = await this.nftContract.purchaseFilm(tokenId, {
                value: ethers_1.ethers.parseEther(price)
            });
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error('Error purchasing film:', error);
            throw new Error('Failed to purchase film');
        }
    }
    async getFilmMetadata(tokenId) {
        try {
            const metadata = await this.nftContract.getFilmMetadata(tokenId);
            return {
                title: metadata.title,
                description: metadata.description,
                genre: metadata.genre,
                duration: Number(metadata.duration),
                releaseDate: Number(metadata.releaseDate),
                producer: metadata.producer,
                ipfsHash: metadata.ipfsHash,
                price: ethers_1.ethers.formatEther(metadata.price),
                isActive: metadata.isActive
            };
        }
        catch (error) {
            console.error('Error getting film metadata:', error);
            throw new Error('Failed to get film metadata');
        }
    }
    async getNFTOwner(tokenId) {
        try {
            return await this.nftContract.ownerOf(tokenId);
        }
        catch (error) {
            console.error('Error getting NFT owner:', error);
            throw new Error('Failed to get NFT owner');
        }
    }
    async getRoyaltyInfo(tokenId, salePrice) {
        try {
            const [recipient, amount] = await this.nftContract.royaltyInfo(tokenId, ethers_1.ethers.parseEther(salePrice));
            return {
                recipient,
                amount: ethers_1.ethers.formatEther(amount)
            };
        }
        catch (error) {
            console.error('Error getting royalty info:', error);
            throw new Error('Failed to get royalty info');
        }
    }
    async createContent(title, ipfsHash) {
        try {
            const tx = await this.contentContract.createContent(title, ipfsHash);
            const receipt = await tx.wait();
            const event = receipt.logs.find((log) => {
                try {
                    const parsed = this.contentContract.interface.parseLog(log);
                    return parsed?.name === 'ContentCreated';
                }
                catch {
                    return false;
                }
            });
            if (!event) {
                throw new Error('ContentCreated event not found');
            }
            const parsedEvent = this.contentContract.interface.parseLog(event);
            const contentId = Number(parsedEvent.args.contentId);
            return {
                contentId,
                txHash: tx.hash
            };
        }
        catch (error) {
            console.error('Error creating content:', error);
            throw new Error('Failed to create content on blockchain');
        }
    }
    async recordView(contentId) {
        try {
            const tx = await this.contentContract.recordView(contentId);
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error('Error recording view:', error);
            throw new Error('Failed to record view');
        }
    }
    async distributeRevenue(contentId, amount) {
        try {
            const tx = await this.contentContract.distributeRevenue(contentId, {
                value: ethers_1.ethers.parseEther(amount)
            });
            await tx.wait();
            return tx.hash;
        }
        catch (error) {
            console.error('Error distributing revenue:', error);
            throw new Error('Failed to distribute revenue');
        }
    }
    async getContent(contentId) {
        try {
            const content = await this.contentContract.getContent(contentId);
            return {
                contentId: Number(content.contentId),
                title: content.title,
                ipfsHash: content.ipfsHash,
                producer: content.producer,
                totalRevenue: ethers_1.ethers.formatEther(content.totalRevenue),
                totalViews: Number(content.totalViews),
                isActive: content.isActive,
                createdAt: Number(content.createdAt)
            };
        }
        catch (error) {
            console.error('Error getting content:', error);
            throw new Error('Failed to get content');
        }
    }
    async verifySignature(message, signature, address) {
        try {
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        }
        catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    }
    getWalletAddress() {
        return this.wallet.address;
    }
    getContractAddresses() {
        return {
            nftContract: process.env.NFT_CONTRACT_ADDRESS,
            contentContract: process.env.CONTENT_CONTRACT_ADDRESS
        };
    }
}
exports.default = new BlockchainService();
//# sourceMappingURL=blockchainService.js.map