# Implementation Plan: Auth Redirect & Custodial Wallet on Lisk Sepolia

## Current Status
- Auth flow: SignupModal handles sign up/sign in but only closes modal on success, no redirect
- Custodial wallet: Automatically generated on login via useCustodialWallet hook using deterministic email-based generation
- Current chain: Uses hardhat testnet, needs to be changed to Lisk Sepolia
- Dashboard: Already exists at /dashboard with auth redirect protection

## Tasks
- [x] Create Lisk Sepolia chain definition in lib/chains.ts
- [x] Update custodial wallet files to use Lisk Sepolia instead of hardhat
- [x] Modify header.tsx to add redirect to /dashboard on successful auth
- [x] Ensure wallet generation works for new sign ups

## Followup steps
- [ ] Test auth redirect functionality
- [ ] Verify wallet generation on Lisk Sepolia
- [ ] Test NFT minting with the custodial wallet
- [x] Update profile page to show custodial wallet info
- [x] Update checkout modal to use custodial wallet for payments
- [x] Update upload page to use custodial wallet
- [x] Store uploaded films in Firestore per user
- [x] Update films page to fetch from Firestore
- [ ] Check smart contract for creator rewards on NFT minting
