# WalletConnect Setup Instructions

To enable WalletConnect for MetaMask and other wallet providers, you need to obtain a Project ID from WalletConnect Cloud.

## Steps to Get Your WalletConnect Project ID

1. **Visit WalletConnect Cloud**
   - Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)

2. **Create an Account**
   - Sign up for a free account if you don't have one
   - Verify your email address

3. **Create a New Project**
   - Once logged in, click "Create New Project"
   - Give your project a name (e.g., "QuiFlix")
   - Add a description (optional)

4. **Copy Your Project ID**
   - After creating the project, you'll see your Project ID
   - Copy this ID

5. **Update the Configuration**
   - Open `src/config/web3.ts`
   - Find line 31: `const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';`
   - Replace `'YOUR_WALLETCONNECT_PROJECT_ID'` with your actual Project ID
   - Save the file

## Example

```typescript
// Before
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID';

// After (with your real ID)
const projectId = 'a1b2c3d4e5f6g7h8i9j0';
```

## Additional Configuration

### Contract Addresses

Don't forget to also update the contract addresses in `src/config/contracts.ts` once you deploy your smart contracts to Base and Lisk networks.

### Testing

After updating the Project ID:
1. Save all files
2. The app will automatically reload
3. Try connecting with MetaMask or Coinbase Wallet
4. The wallet connection dialog should now work properly

## Troubleshooting

- **"Invalid Project ID" error**: Make sure you copied the entire Project ID
- **Connection fails**: Check that your Project ID is active in WalletConnect Cloud
- **MetaMask not detected**: Ensure MetaMask extension is installed in your browser

## Important Notes

- The Project ID is safe to commit to your repository (it's a public identifier)
- You get 1 million API requests per month on the free tier
- Monitor your usage in the WalletConnect Cloud dashboard
