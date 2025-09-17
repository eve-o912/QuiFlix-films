# Wallet Connection Setup Guide

This guide explains how to set up wallet connections for both desktop browser extensions and mobile wallets.

## Prerequisites

1. Get a WalletConnect Project ID:
   - Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your WalletConnect Project ID:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
   ```

## Supported Wallets

### Desktop Browser Extensions
- **MetaMask**: Automatically detects if MetaMask extension is installed
- **Coinbase Wallet**: Works with Coinbase Wallet browser extension

### Mobile Wallets (via WalletConnect)
- **MetaMask Mobile**
- **Trust Wallet**
- **Rainbow Wallet**
- **Coinbase Wallet Mobile**
- **WalletConnect compatible wallets** (200+ wallets)

## How It Works

### For Desktop Users:
1. Click "Connect Wallet"
2. Choose MetaMask or Coinbase Wallet
3. Extension popup will appear asking for connection approval
4. Approve the connection in the extension

### For Mobile Users:
1. Click "Connect Wallet"
2. Choose "Connect with WalletConnect"
3. A QR code will appear
4. Open your mobile wallet app
5. Scan the QR code
6. Approve the connection in your mobile wallet

### Alternative Mobile Flow:
1. On mobile browser, click "Connect Wallet"
2. Choose "Connect with WalletConnect"
3. Wallet app will automatically open (deep linking)
4. Approve the connection in your wallet app

## Features

- **Auto-detection**: Automatically detects installed wallet extensions
- **Mobile-first**: Seamless mobile wallet integration via WalletConnect
- **Multi-chain support**: Supports Ethereum, Polygon, Arbitrum, Optimism, and Base
- **Connection persistence**: Wallet stays connected across browser sessions
- **Error handling**: Clear error messages for connection failures
- **Responsive UI**: Works perfectly on both desktop and mobile

## Usage in Components

### Basic Usage
```tsx
import { useWallet } from '@/hooks/use-wallet'
import { WalletConnectButton } from '@/components/wallet-connect-button'

function MyComponent() {
  const { isConnected, address, formatAddress } = useWallet()

  return (
    <div>
      {isConnected ? (
        <p>Connected: {formatAddress(address)}</p>
      ) : (
        <WalletConnectButton />
      )}
    </div>
  )
}
```

### Custom Redirect After Connection
```tsx
import { WalletConnectButton } from '@/components/wallet-connect-button'

function LandingPage() {
  return (
    <div>
      {/* Redirect to films page after connection */}
      <WalletConnectButton redirectTo="/films" />
      
      {/* Redirect to account page after connection */}
      <WalletConnectButton redirectTo="/account" />
      
      {/* Default redirect is to /films */}
      <WalletConnectButton />
    </div>
  )
}
```

### Using WalletsModal Directly
```tsx
import { WalletsModal } from '@/modals/wallets'

function CustomComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <WalletsModal 
      open={isOpen} 
      onOpenChange={setIsOpen}
      redirectTo="/producer" // Custom redirect
    />
  )
}
```

## Troubleshooting

### Common Issues:

1. **"WalletConnect not working"**
   - Make sure you have set the correct Project ID in `.env.local`
   - Ensure your mobile wallet supports WalletConnect v2

2. **"MetaMask not detected"**
   - Install MetaMask browser extension
   - Refresh the page after installation

3. **"Connection rejected"**
   - User declined the connection in their wallet
   - Try connecting again

4. **"Network not supported"**
   - Make sure your wallet is connected to a supported network
   - Supported networks: Ethereum, Polygon, Arbitrum, Optimism, Base

## Security Notes

- Never share your private keys
- Always verify the website URL before connecting
- Regularly review connected applications in your wallet settings
- Use hardware wallets for large amounts

## Testing

To test the wallet connections:

1. **Desktop Testing**:
   - Install MetaMask extension
   - Try connecting and disconnecting
   - Test with different accounts

2. **Mobile Testing**:
   - Use a mobile device or Chrome DevTools mobile view
   - Test WalletConnect with different mobile wallets
   - Verify QR code scanning works properly
