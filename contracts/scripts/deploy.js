const { ethers } = require("hardhat");
const fs = require('fs');

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
  const contentAddress = contentContract.target;
  console.log("QuiFlixContent deployed to:", contentAddress);

  // Deploy QuiFlixNFT
  const QuiFlixNFT = await ethers.getContractFactory("QuiFlixNFT");
  const nftContract = await QuiFlixNFT.deploy(
    deployer.address, // royalty recipient
    deployer.address  // platform fee recipient
  );

  await nftContract.waitForDeployment();
  const nftAddress = nftContract.target;
  console.log("QuiFlixNFT deployed to:", nftAddress);

  // Save deployment info
  const networkName = (await ethers.provider.getNetwork()).name;
  const deploymentInfo = {
    network: networkName,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contracts: {
      QuiFlixContent: contentAddress,
      QuiFlixNFT: nftAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("Deployment completed successfully!");
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));

  // Save deployment info to file
  fs.writeFileSync('deployments.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📝 IMPORTANT: Update the contract addresses in client/lib/web3.ts:");
  console.log(`QuiFlixNFT: '${nftAddress}'`);
  console.log(`QuiFlixContent: '${contentAddress}'`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
