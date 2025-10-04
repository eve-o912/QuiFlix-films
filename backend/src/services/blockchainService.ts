import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

interface ContractAddresses {
  nftContract: string;
  contentContract: string;
}

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private nftContract: ethers.Contract;
  private contentContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    
    // Contract ABIs (simplified - in production, load from compiled contracts)
    const nftABI = [
      "function createFilm(string memory _title, string memory _description, string memory _genre, uint256 _duration, uint256 _releaseDate, string memory _ipfsHash, uint256 _price, string memory _tokenURI) external returns (uint256)",
      "function approveFilm(uint256 _tokenId) external",
      "function purchaseFilm(uint256 _tokenId) external payable",
      "function transferWithRoyalty(uint256 _tokenId, address _to, uint256 _price) external payable",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function getFilmMetadata(uint256 _tokenId) external view returns (tuple(string title, string description, string genre, uint256 duration, uint256 releaseDate, address producer, string ipfsHash, uint256 price, bool isActive))",
      "function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address, uint256)",
      "event FilmCreated(uint256 indexed tokenId, address indexed producer, string title, uint256 price)",
      "event FilmApproved(uint256 indexed tokenId, address indexed producer, string title)",
      "event FilmPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price)",
      "event RoyaltyPaid(uint256 indexed tokenId, address indexed recipient, uint256 amount)"
    ];

    const contentABI = [
      "function createContent(string memory _title, string memory _ipfsHash) external returns (uint256)",
      "function recordView(uint256 _contentId) external",
      "function distributeRevenue(uint256 _contentId) external payable",
      "function getContent(uint256 _contentId) external view returns (tuple(uint256 contentId, string title, string ipfsHash, address producer, uint256 totalRevenue, uint256 totalViews, bool isActive, uint256 createdAt))",
      "event ContentCreated(uint256 indexed contentId, address indexed producer, string title, string ipfsHash)",
      "event RevenueDistributed(uint256 indexed contentId, address indexed producer, uint256 producerAmount, uint256 platformAmount)"
    ];

    this.nftContract = new ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS!,
      nftABI,
      this.wallet
    );

    this.contentContract = new ethers.Contract(
      process.env.CONTENT_CONTRACT_ADDRESS!,
      contentABI,
      this.wallet
    );
  }

  /**
   * Create a new film NFT
   */
  async createFilm(
    title: string,
    description: string,
    genre: string,
    duration: number,
    releaseDate: number,
    ipfsHash: string,
    price: string,
    tokenURI: string
  ): Promise<{ tokenId: number; txHash: string }> {
    try {
      const tx = await this.nftContract.createFilm(
        title,
        description,
        genre,
        duration,
        releaseDate,
        ipfsHash,
        ethers.parseEther(price),
        tokenURI
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.nftContract.interface.parseLog(log);
          return parsed?.name === 'FilmCreated';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('FilmCreated event not found');
      }

      const parsedEvent = this.nftContract.interface.parseLog(event);
      const tokenId = Number(parsedEvent!.args.tokenId);

      return {
        tokenId,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('Error creating film:', error);
      throw new Error('Failed to create film on blockchain');
    }
  }

  /**
   * Approve a film for sale
   */
  async approveFilm(tokenId: number): Promise<string> {
    try {
      const tx = await this.nftContract.approveFilm(tokenId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error approving film:', error);
      throw new Error('Failed to approve film');
    }
  }

  /**
   * Purchase a film NFT
   */
  async purchaseFilm(tokenId: number, price: string): Promise<string> {
    try {
      const tx = await this.nftContract.purchaseFilm(tokenId, {
        value: ethers.parseEther(price)
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error purchasing film:', error);
      throw new Error('Failed to purchase film');
    }
  }

  /**
   * Transfer NFT with royalty payment
   */
  async transferWithRoyalty(tokenId: number, to: string, price: string): Promise<string> {
    try {
      const tx = await this.nftContract.transferWithRoyalty(tokenId, to, ethers.parseEther(price), {
        value: ethers.parseEther(price)
      });

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error transferring NFT with royalty:', error);
      throw new Error('Failed to transfer NFT with royalty');
    }
  }

  /**
   * Get film metadata from blockchain
   */
  async getFilmMetadata(tokenId: number): Promise<any> {
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
        price: ethers.formatEther(metadata.price),
        isActive: metadata.isActive
      };
    } catch (error) {
      console.error('Error getting film metadata:', error);
      throw new Error('Failed to get film metadata');
    }
  }

  /**
   * Get NFT owner
   */
  async getNFTOwner(tokenId: number): Promise<string> {
    try {
      return await this.nftContract.ownerOf(tokenId);
    } catch (error) {
      console.error('Error getting NFT owner:', error);
      throw new Error('Failed to get NFT owner');
    }
  }

  /**
   * Get royalty info
   */
  async getRoyaltyInfo(tokenId: number, salePrice: string): Promise<{ recipient: string; amount: string }> {
    try {
      const [recipient, amount] = await this.nftContract.royaltyInfo(
        tokenId,
        ethers.parseEther(salePrice)
      );
      
      return {
        recipient,
        amount: ethers.formatEther(amount)
      };
    } catch (error) {
      console.error('Error getting royalty info:', error);
      throw new Error('Failed to get royalty info');
    }
  }

  /**
   * Create content in content contract
   */
  async createContent(title: string, ipfsHash: string): Promise<{ contentId: number; txHash: string }> {
    try {
      const tx = await this.contentContract.createContent(title, ipfsHash);
      const receipt = await tx.wait();

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contentContract.interface.parseLog(log);
          return parsed?.name === 'ContentCreated';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('ContentCreated event not found');
      }

      const parsedEvent = this.contentContract.interface.parseLog(event);
      const contentId = Number(parsedEvent!.args.contentId);

      return {
        contentId,
        txHash: tx.hash
      };
    } catch (error) {
      console.error('Error creating content:', error);
      throw new Error('Failed to create content on blockchain');
    }
  }

  /**
   * Record a view
   */
  async recordView(contentId: number): Promise<string> {
    try {
      const tx = await this.contentContract.recordView(contentId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error recording view:', error);
      throw new Error('Failed to record view');
    }
  }

  /**
   * Distribute revenue
   */
  async distributeRevenue(contentId: number, amount: string): Promise<string> {
    try {
      const tx = await this.contentContract.distributeRevenue(contentId, {
        value: ethers.parseEther(amount)
      });
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error distributing revenue:', error);
      throw new Error('Failed to distribute revenue');
    }
  }

  /**
   * Get content from blockchain
   */
  async getContent(contentId: number): Promise<any> {
    try {
      const content = await this.contentContract.getContent(contentId);
      return {
        contentId: Number(content.contentId),
        title: content.title,
        ipfsHash: content.ipfsHash,
        producer: content.producer,
        totalRevenue: ethers.formatEther(content.totalRevenue),
        totalViews: Number(content.totalViews),
        isActive: content.isActive,
        createdAt: Number(content.createdAt)
      };
    } catch (error) {
      console.error('Error getting content:', error);
      throw new Error('Failed to get content');
    }
  }

  /**
   * Verify wallet signature
   */
  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get contract addresses
   */
  getContractAddresses(): ContractAddresses {
    return {
      nftContract: process.env.NFT_CONTRACT_ADDRESS!,
      contentContract: process.env.CONTENT_CONTRACT_ADDRESS!
    };
  }
}

export default new BlockchainService();
