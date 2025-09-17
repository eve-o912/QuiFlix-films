const { ethers } = require("hardhat");

async function main() {
  const [owner, buyer] = await ethers.getSigners();
  
  // Replace with your deployed contract address
  const NFT_CONTRACT_ADDRESS = "0x..."; // Replace with actual address

  const nftContract = await ethers.getContractAt("QuiFlixNFT", NFT_CONTRACT_ADDRESS);

  const tokenId = 0; // Replace with actual token ID

  // Check current owner
  const currentOwner = await nftContract.ownerOf(tokenId);
  console.log("Current owner:", currentOwner);

  // Transfer NFT
  console.log("Transferring NFT...");
  const transferTx = await nftContract.transferFrom(owner.address, buyer.address, tokenId);
  await transferTx.wait();
  console.log("NFT transferred successfully!");

  // Verify new owner
  const newOwner = await nftContract.ownerOf(tokenId);
  console.log("New owner:", newOwner);

  // Get film metadata
  const filmMetadata = await nftContract.getFilmMetadata(tokenId);
  console.log("Film metadata:", {
    title: filmMetadata.title,
    producer: filmMetadata.producer,
    price: ethers.formatEther(filmMetadata.price),
    isActive: filmMetadata.isActive
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
