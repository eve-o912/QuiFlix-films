import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

interface ContractAddresses {
  nftContract: string;
  contentContract: string;
}

interface FilmMetadata {
  title: string;
  description: string;
  genre: string;
  duration: number;
  releaseDate: number;
  producer: string;
  ipfsHash: string;
  price: string;
  isActive: boolean;
}

interface ContentMetadata {
  contentId: number;
  title: string;
  ipfsHash: string;
  producer: string;
  totalRevenue: string;
  totalViews: number;
  isActive: boolean;
  createdAt: number;
}

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private nftContract: ethers.Contract;
  private contentContract: ethers.Contract;

  constructor() {
    // Validate all required environment variables
    this.validateEnvironmentVariables();

    // Log configuration (without exposing sensitive data)
    console.log('🔗 Initializing Blockchain Service...');
    console.log('  Network: Lisk Sepolia');
    console.log('  RPC URL:', process.env.SEPOLIA_RPC_URL);
    console.log('  NFT Contract:', process.env.NFT_CONTRACT_ADDRESS);
    console.log('  Content Contract:', process.env.CONTENT_CONTRACT_ADDRESS);
    console.log('  Wallet Address:', this.getShortAddress(process.env.PRIVATE_KEY!));

    // Initialize provider and wallet
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, this.provider);
    
    // Contract ABIs
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

    // Initialize contracts
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

    console.log('✅ Blockchain Service initialized successfully');
  }

  /**
   * Validate all required environment variables
   */
  private validateEnvironmentVariables(): void {
    const requiredVars = [
      'SEPOLIA_RPC_URL',
      'PRIVATE_KEY',
      'NFT_CONTRACT_ADDRESS',
      'CONTENT_CONTRACT_ADDRESS'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `❌ Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please add them to your .env file:\n' +
        'SEPOLIA_RPC_URL=https://rpc.sepolia-api.lisk.com\n' +
        'PRIVATE_KEY=your_private_key\n' +
        'NFT_CONTRACT_ADDRESS=0x963097b57fb27f23ac49036757bea84db426a366\n' +
        'CONTENT_CONTRACT_ADDRESS=0xfa5577d2be45f648e3f21fee2aba5941d3e6b422'
      );
    }

    // Validate contract addresses format
    if (!ethers.isAddress(process.env.NFT_CONTRACT_ADDRESS!)) {
      throw new Error('❌ Invalid NFT_CONTRACT_ADDRESS format');
    }

    if (!ethers.isAddress(process.env.CONTENT_CONTRACT_ADDRESS!)) {
      throw new Error('❌ Invalid CONTENT_CONTRACT_ADDRESS format');
    }
  }

  /**
   * Get shortened address for logging
   */
  private getShortAddress(privateKeyOrAddress: string): string {
    try {
      const wallet = new ethers.Wallet(privateKeyOrAddress);
      const addr = wallet.address;
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    } catch {
      return 'Invalid';
    }
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
      console.log(`📽️  Creating film: ${title}`);
      
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

      console.log(`⏳ Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.nftContract.interface.parseLog(log);
          return parsed?.name === 'FilmCreated';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('FilmCreated event not found in transaction logs');
      }

      const parsedEvent = this.nftContract.interface.parseLog(event);
      const tokenId = Number(parsedEvent!.args.tokenId);

      console.log(`🎬 Film created with Token ID: ${tokenId}`);

      return {
        tokenId,
        txHash: tx.hash
      };
    } catch (error: any) {
      console.error('❌ Error creating film:', error);
      throw new Error(`Failed to create film on blockchain: ${error.message}`);
    }
  }

  /**
   * Approve a film for sale
   */
  async approveFilm(tokenId: number): Promise<string> {
    try {
      console.log(`✓ Approving film with Token ID: ${tokenId}`);
      
      const tx = await this.nftContract.approveFilm(tokenId);
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      
      await tx.wait();
      console.log(`✅ Film approved successfully`);
      
      return tx.hash;
    } catch (error: any) {
      console.error('❌ Error approving film:', error);
      throw new Error(`Failed to approve film: ${error.message}`);
    }
  }

  /**
   * Purchase a film NFT
   */
  async purchaseFilm(tokenId: number, price: string): Promise<string> {
    try {
      console.log(`🛒 Purchasing film Token ID: ${tokenId} for ${price} ETH`);
      
      const tx = await this.nftContract.purchaseFilm(tokenId, {
        value: ethers.parseEther(price)
      });

      console.log(`⏳ Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`✅ Film purchased successfully`);

      return tx.hash;
    } catch (error: any) {
      console.error('❌ Error purchasing film:', error);
      throw new Error(`Failed to purchase film: ${error.message}`);
    }
  }

  /**
   * Transfer NFT with royalty payment
   */
  async transferWithRoyalty(tokenId: number, to: string, price: string): Promise<string> {
    try {
      console.log(`🔄 Transferring Token ID: ${tokenId} to ${to} with royalty`);
      
      const tx = await this.nftContract.transferWithRoyalty(
        tokenId, 
        to, 
        ethers.parseEther(price), 
        {
          value: ethers.parseEther(price)
        }
      );

      console.log(`⏳ Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`✅ NFT transferred with royalty successfully`);

      return tx.hash;
    } catch (error: any) {
      console.error('❌ Error transferring NFT with royalty:', error);
      throw new Error(`Failed to transfer NFT with royalty: ${error.message}`);
    }
  }

  /**
   * Get film metadata from blockchain
   */
  async getFilmMetadata(tokenId: number): Promise<FilmMetadata> {
    try {
      console.log(`📖 Fetching metadata for Token ID: ${tokenId}`);
      
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
    } catch (error: any) {
      console.error('❌ Error getting film metadata:', error);
      throw new Error(`Failed to get film metadata: ${error.message}`);
    }
  }

  /**
   * Get NFT owner
   */
  async getNFTOwner(tokenId: number): Promise<string> {
    try {
      const owner = await this.nftContract.ownerOf(tokenId);
      console.log(`👤 Owner of Token ID ${tokenId}: ${owner}`);
      return owner;
    } catch (error: any) {
      console.error('❌ Error getting NFT owner:', error);
      throw new Error(`Failed to get NFT owner: ${error.message}`);
    }
  }

  /**
   * Get royalty info
   */
  async getRoyaltyInfo(tokenId: number, salePrice: string): Promise<{ recipient: string; amount: string }> {
    try {
      console.log(`💰 Getting royalty info for Token ID: ${tokenId}`);
      
      const [recipient, amount] = await this.nftContract.royaltyInfo(
        tokenId,
        ethers.parseEther(salePrice)
      );
      
      const formattedAmount = ethers.formatEther(amount);
      console.log(`  Recipient: ${recipient}`);
      console.log(`  Amount: ${formattedAmount} ETH`);
      
      return {
        recipient,
        amount: formattedAmount
      };
    } catch (error: any) {
      console.error('❌ Error getting royalty info:', error);
      throw new Error(`Failed to get royalty info: ${error.message}`);
    }
  }

  /**
   * Create content in content contract
   */
  async createContent(title: string, ipfsHash: string): Promise<{ contentId: number; txHash: string }> {
    try {
      console.log(`📝 Creating content: ${title}`);
      
      const tx = await this.contentContract.createContent(title, ipfsHash);
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contentContract.interface.parseLog(log);
          return parsed?.name === 'ContentCreated';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('ContentCreated event not found in transaction logs');
      }

      const parsedEvent = this.contentContract.interface.parseLog(event);
      const contentId = Number(parsedEvent!.args.contentId);

      console.log(`📄 Content created with ID: ${contentId}`);

      return {
        contentId,
        txHash: tx.hash
      };
    } catch (error: any) {
      console.error('❌ Error creating content:', error);
      throw new Error(`Failed to create content on blockchain: ${error.message}`);
    }
  }

  /**
   * Record a view
   */
  async recordView(contentId: number): Promise<string> {
    try {
      console.log(`👁️  Recording view for Content ID: ${contentId}`);
      
      const tx = await this.contentContract.recordView(contentId);
      await tx.wait();
      
      console.log(`✅ View recorded successfully`);
      return tx.hash;
    } catch (error: any) {
      console.error('❌ Error recording view:', error);
      throw new Error(`Failed to record view: ${error.message}`);
    }
  }

  /**
   * Distribute revenue
   */
  async distributeRevenue(contentId: number, amount: string): Promise<string> {
    try {
      console.log(`💸 Distributing ${amount} ETH revenue for Content ID: ${contentId}`);
      
      const tx = await this.contentContract.distributeRevenue(contentId, {
        value: ethers.parseEther(amount)
      });
      
      await tx.wait();
      console.log(`✅ Revenue distributed successfully`);
      
      return tx.hash;
    } catch (error: any) {
      console.error('❌ Error distributing revenue:', error);
      throw new Error(`Failed to distribute revenue: ${error.message}`);
    }
  }

  /**
   * Get content from blockchain
   */
  async getContent(contentId: number): Promise<ContentMetadata> {
    try {
      console.log(`📖 Fetching content with ID: ${contentId}`);
      
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
    } catch (error: any) {
      console.error('❌ Error getting content:', error);
      throw new Error(`Failed to get content: ${error.message}`);
    }
  }

  /**
   * Verify wallet signature
   */
  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      console.log(`🔐 Verifying signature for address: ${address}`);
      
      const recoveredAddress = ethers.verifyMessage(message, signature);
      const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      
      console.log(isValid ? '✅ Signature valid' : '❌ Signature invalid');
      return isValid;
    } catch (error: any) {
      console.error('❌ Error verifying signature:', error);
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

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error('❌ Error getting wallet balance:', error);
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  /**
   * Check if address has enough balance
   */
  async hasEnoughBalance(address: string, requiredAmount: string): Promise<boolean> {
    try {
      const balance = await this.provider.getBalance(address);
      const required = ethers.parseEther(requiredAmount);
      return balance >= required;
    } catch (error: any) {
      console.error('❌ Error checking balance:', error);
      return false;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      return ethers.formatUnits(feeData.gasPrice || 0n, 'gwei');
    } catch (error: any) {
      console.error('❌ Error getting gas price:', error);
      throw new Error(`Failed to get gas price: ${error.message}`);
    }
  }

  /**
   * Health check - verify connection to blockchain
   */
  async healthCheck(): Promise<{ status: string; blockNumber: number; network: string }> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        status: 'connected',
        blockNumber,
        network: network.name
      };
    } catch (error: any) {
      console.error('❌ Health check failed:', error);
      throw new Error(`Blockchain connection failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new BlockchainService();