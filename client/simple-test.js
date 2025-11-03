const { ethers } = require('ethers');

async function simpleTest() {
  console.log('🚀 Simple Frontend Integration Test');
  console.log('===================================');
  
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  
  // Contract addresses
  const NFT_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  
  // Simple ABI
  const nftABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function getFilmMetadata(uint256 _tokenId) external view returns (tuple(string title, string description, string genre, uint256 duration, uint256 releaseDate, address producer, string ipfsHash, uint256 price, bool isActive))",
    "function ownerOf(uint256 tokenId) external view returns (address)"
  ];

  const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, nftABI, provider);

  try {
    // Test contract connection
    console.log('📋 Testing Contract Connection');
    const name = await contract.name();
    const symbol = await contract.symbol();
    console.log(`✅ Contract: ${name} (${symbol})`);
    console.log(`✅ Address: ${NFT_CONTRACT_ADDRESS}`);
    console.log('');

    // Test film metadata
    console.log('🎬 Testing Film Metadata');
    const metadata = await contract.getFilmMetadata(0);
    console.log('✅ Film Metadata Retrieved:');
    console.log(`   Title: ${metadata.title}`);
    console.log(`   Description: ${metadata.description}`);
    console.log(`   Genre: ${metadata.genre}`);
    console.log(`   Duration: ${metadata.duration} seconds`);
    console.log(`   Price: ${ethers.formatEther(metadata.price)} ETH`);
    console.log(`   Producer: ${metadata.producer}`);
    console.log(`   IPFS Hash: ${metadata.ipfsHash}`);
    console.log(`   Active: ${metadata.isActive}`);
    console.log('');

    // Test ownership
    console.log('👤 Testing Ownership');
    const owner = await contract.ownerOf(0);
    console.log(`✅ NFT Owner: ${owner}`);
    console.log('');

    console.log('🎯 Frontend Integration Status');
    console.log('==============================');
    console.log('✅ Smart contracts deployed and accessible');
    console.log('✅ Contract metadata retrieval working');
    console.log('✅ Film metadata available for frontend');
    console.log('✅ Ownership verification functional');
    console.log('');
    console.log('🚀 Frontend is ready to connect!');
    console.log('');
    console.log('📱 Next Steps:');
    console.log('   1. Open http://localhost:3000/films-blockchain');
    console.log('   2. Connect MetaMask to localhost:8545');
    console.log('   3. Import test account: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
    console.log('   4. Test the blockchain integration!');
    console.log('');
    console.log('Contract Details:');
    console.log(`   NFT Contract: ${NFT_CONTRACT_ADDRESS}`);
    console.log(`   Test Film Token ID: 0`);
    console.log(`   Current Owner: ${owner}`);
    console.log(`   Price: ${ethers.formatEther(metadata.price)} ETH`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest().catch(console.error);
