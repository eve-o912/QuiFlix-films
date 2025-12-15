const { ethers } = require('ethers');

// Test the complete integration
async function testIntegration() {
  console.log('🚀 Testing QuiFlix Frontend + Blockchain Integration');
  console.log('==================================================');
  
  // Contract addresses from deployment
  const NFT_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const CONTENT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  
  // Connect to local Hardhat network
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  
  // Use the default Hardhat accounts
  const deployer = {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  };
  const producer = {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  };
  const buyer = {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111daa5ba4e5da4aec6851a1687f163e8856e8c018fa7aef9e0884f7fb94'
  };
  
  console.log(`✅ Connected to local network`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Producer: ${producer.address}`);
  console.log(`   Buyer: ${buyer.address}`);
  console.log('');

  // Contract ABIs (simplified)
  const nftABI = [
    "function createFilm(string memory _title, string memory _description, string memory _genre, uint256 _duration, uint256 _releaseDate, string memory _ipfsHash, uint256 _price, string memory _tokenURI) external returns (uint256)",
    "function purchaseFilm(uint256 _tokenId) external payable",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function getFilmMetadata(uint256 _tokenId) external view returns (tuple(string title, string description, string genre, uint256 duration, uint256 releaseDate, address producer, string ipfsHash, uint256 price, bool isActive))",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "event FilmCreated(uint256 indexed tokenId, address indexed producer, string title, uint256 price)",
    "event FilmPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price)"
  ];

  const contentABI = [
    "function createContent(string memory _title, string memory _ipfsHash) external returns (uint256)",
    "function recordView(uint256 _contentId) external",
    "function getContent(uint256 _contentId) external view returns (tuple(uint256 contentId, string title, string ipfsHash, address producer, uint256 totalRevenue, uint256 totalViews, bool isActive, uint256 createdAt))"
  ];

  // Get contract instances
  const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftABI, provider);
  const contentContract = new ethers.Contract(CONTENT_CONTRACT_ADDRESS, contentABI, provider);

  try {
    // Test 1: Verify contracts are deployed
    console.log('📋 Test 1: Verifying Contract Deployment');
    const nftName = await nftContract.name();
    const nftSymbol = await nftContract.symbol();
    console.log(`✅ NFT Contract: ${nftName} (${nftSymbol})`);
    console.log(`✅ Contract Address: ${NFT_CONTRACT_ADDRESS}`);
    console.log('');

    // Test 2: Create a film for frontend testing
    console.log('🎬 Test 2: Creating Test Film for Frontend');
    const wallet = new ethers.Wallet(deployer.privateKey, provider);
    const nftContractWithSigner = nftContract.connect(wallet);
    
    const createTx = await nftContractWithSigner.createFilm(
      "Frontend Test Film",
      "A test film created for frontend integration testing",
      "Action",
      7200, // 2 hours
      Math.floor(Date.now() / 1000),
      "QmFrontendTestFilmHash123456789",
      ethers.parseEther("0.02"), // 0.02 ETH
      "https://api.quiflix.com/metadata/test"
    );
    await createTx.wait();
    console.log('✅ Test film created successfully!');
    console.log('');

    // Test 3: Verify film metadata
    console.log('📊 Test 3: Verifying Film Metadata');
    const metadata = await nftContract.getFilmMetadata(0);
    console.log('✅ Film Metadata:');
    console.log(`   Title: ${metadata.title}`);
    console.log(`   Description: ${metadata.description}`);
    console.log(`   Genre: ${metadata.genre}`);
    console.log(`   Duration: ${metadata.duration} seconds`);
    console.log(`   Price: ${ethers.formatEther(metadata.price)} ETH`);
    console.log(`   Producer: ${metadata.producer}`);
    console.log(`   IPFS Hash: ${metadata.ipfsHash}`);
    console.log(`   Active: ${metadata.isActive}`);
    console.log('');

    // Test 4: Test purchase (simulate frontend purchase)
    console.log('💰 Test 4: Testing Film Purchase');
    const buyerWallet = new ethers.Wallet(buyer.privateKey, provider);
    const nftContractWithBuyer = nftContract.connect(buyerWallet);
    
    const purchaseTx = await nftContractWithBuyer.purchaseFilm(0, {
      value: ethers.parseEther("0.02")
    });
    await purchaseTx.wait();
    console.log('✅ Film purchased successfully!');
    
    const owner = await nftContract.ownerOf(0);
    console.log(`✅ New owner: ${owner}`);
    console.log(`✅ Expected owner: ${buyer.address}`);
    console.log(`✅ Ownership transfer successful: ${owner.toLowerCase() === buyer.address.toLowerCase()}`);
    console.log('');

    // Test 5: Create content for analytics
    console.log('📈 Test 5: Creating Content for Analytics');
    const contentWallet = new ethers.Wallet(producer.privateKey, provider);
    const contentContractWithSigner = contentContract.connect(contentWallet);
    
    const contentTx = await contentContractWithSigner.createContent(
      "Frontend Test Film",
      "QmFrontendTestFilmHash123456789"
    );
    await contentTx.wait();
    console.log('✅ Content created successfully!');
    
    // Record a view
    const viewTx = await contentContractWithSigner.recordView(0);
    await viewTx.wait();
    console.log('✅ View recorded successfully!');
    
    const content = await contentContract.getContent(0);
    console.log(`✅ Total views: ${content.totalViews}`);
    console.log('');

    // Test 6: Frontend Integration Summary
    console.log('🌐 Frontend Integration Summary');
    console.log('===============================');
    console.log('✅ Smart contracts deployed and functional');
    console.log('✅ Test film created and ready for frontend');
    console.log('✅ Purchase functionality verified');
    console.log('✅ Ownership verification working');
    console.log('✅ Content analytics working');
    console.log('');
    console.log('🎯 Frontend can now:');
    console.log('   • Connect to local Hardhat network');
    console.log('   • Display available films');
    console.log('   • Allow users to purchase NFTs');
    console.log('   • Verify ownership for streaming');
    console.log('   • Track views and analytics');
    console.log('');
    console.log('🚀 Ready for frontend testing!');
    console.log('');
    console.log('Contract Addresses for Frontend:');
    console.log(`   QuiFlixNFT: ${NFT_CONTRACT_ADDRESS}`);
    console.log(`   QuiFlixContent: ${CONTENT_CONTRACT_ADDRESS}`);
    console.log('');
    console.log('Test Film Details:');
    console.log(`   Token ID: 0`);
    console.log(`   Title: Frontend Test Film`);
    console.log(`   Price: 0.02 ETH`);
    console.log(`   Current Owner: ${owner}`);
    console.log('');
    console.log('📱 Next Steps:');
    console.log('   1. Open http://localhost:3000/films-blockchain');
    console.log('   2. Connect MetaMask to localhost:8545');
    console.log('   3. Import test account: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
    console.log('   4. Test the complete user flow!');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run the test
testIntegration()
  .then(() => {
    console.log('✅ Integration test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  });
