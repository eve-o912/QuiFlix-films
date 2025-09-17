const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy QuiFlixContent first
  const QuiFlixContent = await ethers.getContractFactory("QuiFlixContent");
  const contentContract = await QuiFlixContent.deploy(
    deployer.address, // producer address
    9500, // 95% to producer
    deployer.address, // platform address (same as deployer for now)
    500  // 5% to platform
  );

  await contentContract.waitForDeployment();
  const contentAddress = await contentContract.getAddress();
  console.log("QuiFlixContent deployed to:", contentAddress);

  // Deploy QuiFlixNFT
  const QuiFlixNFT = await ethers.getContractFactory("QuiFlixNFT");
  const nftContract = await QuiFlixNFT.deploy(
    deployer.address, // royalty recipient
    deployer.address  // platform fee recipient
  );

  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log("QuiFlixNFT deployed to:", nftAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contracts: {
      QuiFlixContent: contentAddress,
      QuiFlixNFT: nftAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("Deployment completed successfully!");
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
