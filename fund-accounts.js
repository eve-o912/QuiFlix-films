const { ethers } = require('ethers');

async function fundAccounts() {
  console.log('💰 Funding test accounts...');
  
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  
  const deployer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
  const buyer = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
  
  // Send 10 ETH to buyer
  const tx = await deployer.sendTransaction({
    to: buyer,
    value: ethers.parseEther('10')
  });
  
  await tx.wait();
  console.log('✅ Funded buyer account with 10 ETH');
  
  const balance = await provider.getBalance(buyer);
  console.log(`✅ Buyer balance: ${ethers.formatEther(balance)} ETH`);
}

fundAccounts().catch(console.error);
