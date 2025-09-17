const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Verifying contracts with the account:", deployer.address);

  // Replace with your deployed contract addresses
  const NFT_CONTRACT_ADDRESS = "0x..."; // Replace with actual address
  const CONTENT_CONTRACT_ADDRESS = "0x..."; // Replace with actual address

  try {
    // Verify QuiFlixNFT contract
    console.log("Verifying QuiFlixNFT contract...");
    await hre.run("verify:verify", {
      address: NFT_CONTRACT_ADDRESS,
      constructorArguments: [
        deployer.address, // royalty recipient
        deployer.address  // platform fee recipient
      ],
    });
    console.log("QuiFlixNFT contract verified successfully!");

    // Verify QuiFlixContent contract
    console.log("Verifying QuiFlixContent contract...");
    await hre.run("verify:verify", {
      address: CONTENT_CONTRACT_ADDRESS,
      constructorArguments: [
        deployer.address, // producer address
        9500, // 95% to producer
        deployer.address, // platform address
        500  // 5% to platform
      ],
    });
    console.log("QuiFlixContent contract verified successfully!");

  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
