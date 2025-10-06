# TODO: Custodial Wallet and Blockchain Upload Integration

## Current Status
- Custodial wallet is EVM compatible (uses viem library)
- Wallet configured for Lisk Sepolia testnet
- Header dropdown copies email; needs to copy wallet address
- Upload page uploads to backend API; needs blockchain transaction

## Tasks

### 1. Update Header Dropdown to Copy Wallet Address
- [ ] Import `useCustodialWallet` hook in `components/header.tsx`
- [ ] Change "Signed in as {currentUser?.email}" to "Wallet: {formatAddress(address)}"
- [ ] Update copy function to copy wallet address instead of email
- [ ] Update display text accordingly

### 2. Add Blockchain Transaction to Upload
- [ ] Get deployed contract addresses for QuiFlixContent and QuiFlixNFT on Lisk Sepolia
- [ ] Add contract ABIs to the project (create `lib/abis.ts` or similar)
- [ ] Update `app/upload/page.tsx` to include blockchain transaction after form validation
- [ ] Use `writeContract` from `useCustodialWallet` to call `createContent` on QuiFlixContent contract
- [ ] Handle transaction success/failure and update UI accordingly
- [ ] Store transaction hash and content ID in database/backend

### 3. Enable Frontend Querying of Film Attributes
- [ ] Create utility functions to query film data from blockchain
- [ ] Update film display components to fetch attributes from on-chain data
- [ ] Ensure film cards show on-chain attributes like title, description, etc.

### 4. Testing and Validation
- [ ] Test wallet address copying in header
- [ ] Test upload with blockchain transaction
- [ ] Verify transaction deducts from wallet balance
- [ ] Test querying film attributes from frontend

## Dependencies
- Contract addresses for QuiFlixContent and QuiFlixNFT on Lisk Sepolia
- ABIs for the contracts
- Possibly update backend to store transaction data

## Notes
- Custodial wallet already uses Lisk Sepolia testnet
- Transaction will deduct gas fees from the custodial wallet
- Use QuiFlixContent.createContent for basic content registration
- Consider using QuiFlixNFT.createFilm for NFT minting if needed
