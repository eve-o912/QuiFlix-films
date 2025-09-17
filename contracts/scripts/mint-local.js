const { ethers } = require("hardhat");

async function main() {
  const [deployer, buyer] = await ethers.getSigners();
  
  // Use the deployed contract addresses from local deployment
  const NFT_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const CONTENT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const nftContract = await ethers.getContractAt("QuiFlixNFT", NFT_CONTRACT_ADDRESS);
  const contentContract = await ethers.getContractAt("QuiFlixContent", CONTENT_CONTRACT_ADDRESS);

  console.log("Creating content...");
  const contentTx = await contentContract.createContent(
    "Sample Film Title",
    "QmSampleIPFSHash123456789" // Replace with actual IPFS hash
  );
  await contentTx.wait();
  console.log("Content created successfully!");

  console.log("Creating NFT film...");
  const nftTx = await nftContract.createFilm(
    "Sample Film Title",
    "A sample film description",
    "Action",
    7200, // 2 hours in seconds
    Math.floor(Date.now() / 1000), // Current timestamp
    "QmSampleIPFSHash123456789", // IPFS hash
    ethers.parseEther("0.01"), // 0.01 ETH
    "https://api.quiflix.com/metadata/1" // Metadata URI
  );
  await nftTx.wait();
  console.log("NFT film created successfully!");

  // Get the token ID (assuming it's the first one)
  const tokenId = 0;
  
  console.log("Purchasing film...");
  try {
    const purchaseTx = await nftContract.connect(buyer).purchaseFilm(tokenId, {
      value: ethers.parseEther("0.01")
    });
    await purchaseTx.wait();
    console.log("Film purchased successfully!");

    // Verify ownership
    const owner = await nftContract.ownerOf(tokenId);
    console.log(`NFT owner: ${owner}`);
    console.log(`Buyer address: ${buyer.address}`);
  } catch (error) {
    console.log("Purchase failed:", error.message);
    
    // Check if NFT exists
    try {
      const owner = await nftContract.ownerOf(tokenId);
      console.log(`NFT owner: ${owner}`);
    } catch (ownerError) {
      console.log("NFT does not exist or purchase failed");
    }
  }

  console.log("Minting script completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
