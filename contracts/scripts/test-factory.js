const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Testing with contract factory...");
  
  // Deploy a fresh contract
  const QuiFlixNFT = await ethers.getContractFactory("QuiFlixNFT");
  const nftContract = await QuiFlixNFT.deploy(
    deployer.address, // royalty recipient
    deployer.address  // platform fee recipient
  );
  
  await nftContract.waitForDeployment();
  const contractAddress = await nftContract.getAddress();
  
  console.log(`Contract deployed to: ${contractAddress}`);
  
  // Test contract info
  const name = await nftContract.name();
  const symbol = await nftContract.symbol();
  const owner = await nftContract.owner();
  
  console.log(`Contract name: ${name}`);
  console.log(`Contract symbol: ${symbol}`);
  console.log(`Contract owner: ${owner}`);
  console.log(`Deployer address: ${deployer.address}`);

  // Test creating a film
  console.log("\nCreating a film...");
  const createTx = await nftContract.createFilm(
    "Test Film",
    "A test film description",
    "Action",
    7200, // 2 hours in seconds
    Math.floor(Date.now() / 1000), // Current timestamp
    "QmTestHash123", // IPFS hash
    ethers.parseEther("0.01"), // 0.01 ETH
    "https://api.test.com/metadata/1" // Metadata URI
  );
  await createTx.wait();
  console.log("Film created successfully!");

  // Check if NFT exists
  try {
    const nftOwner = await nftContract.ownerOf(0);
    console.log(`NFT 0 owner: ${nftOwner}`);
  } catch (error) {
    console.log("NFT 0 does not exist or error:", error.message);
  }

  // Get film metadata
  try {
    const metadata = await nftContract.getFilmMetadata(0);
    console.log("Film metadata:", {
      title: metadata.title,
      producer: metadata.producer,
      price: ethers.formatEther(metadata.price),
      isActive: metadata.isActive
    });
  } catch (error) {
    console.log("Error getting metadata:", error.message);
  }

  console.log("\nTest completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
