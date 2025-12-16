# QuiFlix Wallet Integration Setup

## Overview
QuiFlix supports both MetaMask and Coinbase Wallet for purchasing films on Base and Lisk networks using USDC.

## Quick Start

### 1. Get WalletConnect Project ID
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a free account
3. Create a new project
4. Copy your Project ID
5. Update `src/config/web3.ts` line 24 with your Project ID:
   ```typescript
   const projectId = 'YOUR_PROJECT_ID_HERE';
   ```

### 2. Deploy Smart Contracts
Deploy your contracts to Base and Lisk networks, then update addresses in `src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  base: {
    nft: '0xYOUR_NFT_CONTRACT_ADDRESS',
    content: '0xYOUR_CONTENT_CONTRACT_ADDRESS',
  },
  lisk: {
    nft: '0xYOUR_NFT_CONTRACT_ADDRESS',
    content: '0xYOUR_CONTENT_CONTRACT_ADDRESS',
  },
};
```

### 3. Test Networks (Optional)
For testing, you can use Base Sepolia and Lisk Sepolia testnets before mainnet deployment.

## Supported Networks

### Base Mainnet
- Chain ID: 8453
- RPC: https://mainnet.base.org
- USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

### Lisk Mainnet
- Chain ID: 1135
- RPC: https://rpc.api.lisk.com
- USDC: 0x05D032ac25d322df992303dCa074EE7392C117b9

## Features

### Wallet Connection
- ✅ MetaMask integration
- ✅ Coinbase Wallet integration
- ✅ Automatic wallet detection
- ✅ Network switching

### Purchase Options
1. **NFT Ticket (Resellable)**
   - Full ownership as NFT
   - Can be resold on secondary markets
   - Includes 2.5% royalty to creators

2. **Direct Access (Stream-only)**
   - Lower price point
   - Stream-only access
   - Direct revenue to creators

### Payment
- USDC payments on Base or Lisk
- Automatic network switching
- Transaction confirmation tracking

## User Flow

1. **Browse Films** → Free trailer viewing
2. **Click "Buy Now"** → Purchase dialog opens
3. **Select Purchase Type** → NFT or Direct
4. **Select Network** → Base or Lisk
5. **Connect Wallet** → MetaMask or Coinbase
6. **Confirm Transaction** → Complete purchase
7. **Watch Film** → Access granted

## Development Notes

- Update contract ABIs in `src/config/contracts.ts` if you modify smart contracts
- Test on testnets before mainnet deployment
- Ensure sufficient USDC balance on selected network
- Gas fees are paid in native tokens (ETH on Base, LSK on Lisk)
