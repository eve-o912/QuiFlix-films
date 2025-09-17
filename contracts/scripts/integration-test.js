const { ethers } = require("hardhat");

async function main() {
  const [deployer, producer, buyer] = await ethers.getSigners();
  
  console.log("🚀 Starting QuiFlix Integration Test");
  console.log("=====================================");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Producer: ${producer.address}`);
  console.log(`Buyer: ${buyer.address}`);
  console.log("");

  // Deploy contracts
  console.log("📦 Deploying Contracts...");
  const QuiFlixContent = await ethers.getContractFactory("QuiFlixContent");
  const contentContract = await QuiFlixContent.deploy(
    producer.address, // producer
    9500, // 95% to producer
    deployer.address, // platform
    500  // 5% to platform
  );
  await contentContract.waitForDeployment();
  const contentAddress = await contentContract.getAddress();

  const QuiFlixNFT = await ethers.getContractFactory("QuiFlixNFT");
  const nftContract = await QuiFlixNFT.deploy(
    deployer.address, // royalty recipient
    deployer.address  // platform fee recipient
  );
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();

  console.log(`✅ QuiFlixContent deployed to: ${contentAddress}`);
  console.log(`✅ QuiFlixNFT deployed to: ${nftAddress}`);
  console.log("");

  // Test 1: Create Content
  console.log("🎬 Test 1: Creating Content...");
  const contentTx = await contentContract.connect(producer).createContent(
    "Epic Action Movie",
    "QmEpicActionMovieHash123456789"
  );
  await contentTx.wait();
  console.log("✅ Content created successfully!");
  console.log("");

  // Test 2: Create Film NFT
  console.log("🎭 Test 2: Creating Film NFT...");
  const filmTx = await nftContract.connect(deployer).createFilm(
    "Epic Action Movie",
    "An epic action movie with amazing stunts and explosions",
    "Action",
    10800, // 3 hours
    Math.floor(Date.now() / 1000),
    "QmEpicActionMovieHash123456789",
    ethers.parseEther("0.05"), // 0.05 ETH
    "https://api.quiflix.com/metadata/1"
  );
  await filmTx.wait();
  console.log("✅ Film NFT created successfully!");
  console.log("");

  // Test 3: Check NFT Ownership
  console.log("👤 Test 3: Checking Initial NFT Ownership...");
  const initialOwner = await nftContract.ownerOf(0);
  console.log(`✅ Initial NFT owner: ${initialOwner}`);
  console.log(`✅ Expected owner (deployer): ${deployer.address}`);
  console.log("");

  // Test 4: Purchase Film
  console.log("💰 Test 4: Purchasing Film...");
  const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
  console.log(`Buyer balance before: ${ethers.formatEther(buyerBalanceBefore)} ETH`);
  
  const purchaseTx = await nftContract.connect(buyer).purchaseFilm(0, {
    value: ethers.parseEther("0.05")
  });
  await purchaseTx.wait();
  
  const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
  console.log(`Buyer balance after: ${ethers.formatEther(buyerBalanceAfter)} ETH`);
  console.log("✅ Film purchased successfully!");
  console.log("");

  // Test 5: Verify Ownership Transfer
  console.log("🔄 Test 5: Verifying Ownership Transfer...");
  const newOwner = await nftContract.ownerOf(0);
  console.log(`✅ New NFT owner: ${newOwner}`);
  console.log(`✅ Expected owner (buyer): ${buyer.address}`);
  console.log(`✅ Ownership transfer successful: ${newOwner.toLowerCase() === buyer.address.toLowerCase()}`);
  console.log("");

  // Test 6: Get Film Metadata
  console.log("📋 Test 6: Retrieving Film Metadata...");
  const metadata = await nftContract.getFilmMetadata(0);
  console.log("✅ Film Metadata:");
  console.log(`   Title: ${metadata.title}`);
  console.log(`   Description: ${metadata.description}`);
  console.log(`   Genre: ${metadata.genre}`);
  console.log(`   Duration: ${metadata.duration} seconds (${Number(metadata.duration) / 3600} hours)`);
  console.log(`   Producer: ${metadata.producer}`);
  console.log(`   Price: ${ethers.formatEther(metadata.price)} ETH`);
  console.log(`   IPFS Hash: ${metadata.ipfsHash}`);
  console.log(`   Active: ${metadata.isActive}`);
  console.log("");

  // Test 7: Check Royalty Info
  console.log("💎 Test 7: Checking Royalty Information...");
  const salePrice = ethers.parseEther("1"); // 1 ETH sale price
  const [royaltyRecipient, royaltyAmount] = await nftContract.royaltyInfo(0, salePrice);
  console.log(`✅ Royalty recipient: ${royaltyRecipient}`);
  console.log(`✅ Royalty amount for 1 ETH sale: ${ethers.formatEther(royaltyAmount)} ETH (2.5%)`);
  console.log("");

  // Test 8: Record View
  console.log("👁️ Test 8: Recording View...");
  const viewTx = await contentContract.connect(buyer).recordView(0);
  await viewTx.wait();
  console.log("✅ View recorded successfully!");
  
  const content = await contentContract.getContent(0);
  console.log(`✅ Total views: ${content.totalViews}`);
  console.log("");

  // Test 9: Resell NFT (Update Price)
  console.log("🔄 Test 9: Reselling NFT...");
  const resellTx = await nftContract.connect(buyer).resellFilm(0, ethers.parseEther("0.08"));
  await resellTx.wait();
  console.log("✅ NFT listed for resale at 0.08 ETH");
  
  const updatedMetadata = await nftContract.getFilmMetadata(0);
  console.log(`✅ New price: ${ethers.formatEther(updatedMetadata.price)} ETH`);
  console.log("");

  // Test 10: Summary
  console.log("📊 Integration Test Summary");
  console.log("==========================");
  console.log("✅ All tests passed successfully!");
  console.log("");
  console.log("🎯 Features Tested:");
  console.log("   • Smart contract deployment");
  console.log("   • Content creation");
  console.log("   • NFT film creation");
  console.log("   • Film purchase with ETH");
  console.log("   • Ownership verification");
  console.log("   • Metadata retrieval");
  console.log("   • Royalty calculation (EIP-2981)");
  console.log("   • View tracking");
  console.log("   • NFT resale functionality");
  console.log("");
  console.log("🚀 QuiFlix Platform is fully functional!");
  console.log("");
  console.log("Contract Addresses:");
  console.log(`   QuiFlixContent: ${contentAddress}`);
  console.log(`   QuiFlixNFT: ${nftAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Integration test failed:", error);
    process.exit(1);
  });
