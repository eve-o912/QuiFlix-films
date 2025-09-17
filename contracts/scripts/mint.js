const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Use the deployed contract addresses from local deployment
  const NFT_CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const CONTENT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const nftContract = await ethers.getContractAt("QuiFlixNFT", NFT_CONTRACT_ADDRESS);
  const contentContract = await ethers.getContractAt("QuiFlixContent", CONTENT_CONTRACT_ADDRESS);

  // Create content first
  console.log("Creating content...");
  const contentTx = await contentContract.createContent(
    "Sample Film Title",
    "QmSampleIPFSHash123456789" // Replace with actual IPFS hash
  );
  await contentTx.wait();
  console.log("Content created successfully!");

  // Create NFT film
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
  
  // Purchase the film
  console.log("Purchasing film...");
  const purchaseTx = await nftContract.purchaseFilm(tokenId, {
    value: ethers.parseEther("0.01")
  });
  await purchaseTx.wait();
  console.log("Film purchased successfully!");

  console.log("Minting script completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
