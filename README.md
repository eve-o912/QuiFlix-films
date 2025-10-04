# QuiFlix - NFT Film Streaming Platform

A decentralized film streaming platform where users can purchase, own, and trade films as NFTs. Built with Next.js, Express.js, PostgreSQL, and Ethereum smart contracts.

## 🎬 Features

- **Hybrid Onchain/Offchain System**: Films stored offchain (IPFS + database) with NFT ownership onchain
- **Film Approval Workflow**: Admin approval required before films become available for purchase
- **NFT Film Ownership**: Purchase films as NFTs with blockchain ownership and royalties
- **Decentralized Storage**: Films stored on IPFS for censorship resistance
- **Producer Dashboard**: Revenue tracking and analytics for content creators
- **Secondary Market**: Resell NFTs with automatic royalty distribution
- **Streaming Platform**: Secure streaming with NFT ownership verification
- **Analytics**: Comprehensive view tracking and revenue reporting

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (Ethereum)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL     │
                       │   Database       │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   IPFS Storage   │
                       │   (Decentralized)│
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Ethereum wallet with Sepolia ETH
- IPFS node (optional)

### 1. Clone Repository
```bash
git clone <repository-url>
cd QuiFlix-films
```

### 2. Smart Contracts Setup
```bash
cd contracts
npm install
npm run compile

# Deploy to Sepolia (requires .env with RPC_URL and PRIVATE_KEY)
npm run deploy:sepolia
```

### 3. Backend Setup
```bash
cd backend
npm install

# Set up environment
cp env.example .env
# Edit .env with your configuration

# Set up database
createdb quiflix

# Start development server
npm run dev
```

### 4. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
QuiFlix-films/
├── app/                    # Next.js frontend
│   ├── films/             # Film pages
│   ├── producer/          # Producer dashboard
│   └── watch/             # Streaming pages
├── components/            # React components
├── contracts/             # Smart contracts
│   ├── contracts/         # Solidity contracts
│   ├── scripts/           # Deployment scripts
│   └── test/              # Contract tests
├── backend/               # Express.js API
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── middleware/    # Express middleware
│   └── uploads/           # File uploads
└── docs/                  # Documentation
```

## 🔧 Smart Contracts

### QuiFlixNFT Contract
- ERC-721 NFT standard with EIP-2981 royalty support
- **Hybrid System**: Films stored offchain, ownership tracked onchain
- **Approval Workflow**: Films start inactive, require admin approval to activate
- **Royalty Distribution**: 2.5% creator royalties on primary sales, automatic royalties on secondary sales
- **Platform Fees**: 1% platform fee on all transactions
- Purchase and resale functionality with automatic royalty payments

### QuiFlixContent Contract
- Content management and metadata storage
- Revenue distribution and tracking
- View tracking and analytics
- Producer royalty splits and earnings management

## 📡 API Endpoints

### Authentication
- `POST /api/users/sign-message` - Get message for wallet signing
- `POST /api/users/authenticate` - Authenticate with wallet signature

### Film Management
- `GET /api/films` - Get all films
- `POST /api/films/upload` - Upload new film (producer only) - creates inactive NFT
- `POST /api/films/approve` - Approve film for sale (admin only) - activates NFT
- `POST /api/films/purchase` - Purchase film NFT with royalty distribution
- `GET /api/films/stream/:tokenId` - Stream film (NFT owner only)
- `POST /api/films/resell` - Resell NFT with automatic royalty payments

### Analytics
- `GET /api/films/analytics/:filmId` - Get film analytics
- `GET /api/films/producer/revenue` - Get producer revenue report

## 🗄️ Database Schema

- **Users**: Wallet addresses, profiles, producer status
- **Films**: Metadata, IPFS hashes, pricing, NFT data
- **Purchases**: Transaction records, ownership history
- **Views**: Viewing analytics, completion rates

## 🔒 Security Features

- Wallet signature authentication
- JWT token-based sessions
- NFT ownership verification
- Rate limiting and CORS protection
- File upload validation
- Input sanitization

## 🚀 Deployment

### Smart Contracts
```bash
cd contracts
npm run deploy:sepolia
npm run verify
```

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
npm run build
npm start
```

## 🆕 Recent Updates

### Hybrid Onchain/Offchain System ✅
- **Film Upload**: Films are uploaded offchain (IPFS + database) but NFTs are minted onchain
- **Approval Workflow**: All films start inactive and require admin approval before becoming available for purchase
- **True NFT Ownership**: Purchases actually mint NFTs with proper ownership transfer
- **Royalty System**: Creators receive 2.5% royalties on primary sales and automatic royalties on secondary sales
- **Platform Fees**: 1% platform fee collected on all transactions

### Working Features ✅
- Smart contract compilation and deployment
- Backend API integration with blockchain
- Frontend upload flow with file handling
- Purchase flow with real NFT minting
- Admin approval system for content moderation

## 📊 Key Features

### For Users
- Browse and discover films
- Purchase films as NFTs with true ownership
- Stream owned content with NFT verification
- Trade NFTs on secondary market with automatic royalties
- Track viewing history and NFT collection

### For Producers
- Upload films with metadata (requires approval)
- Set pricing and royalty preferences
- Track revenue and analytics from NFT sales
- Manage content library with approval status
- View audience engagement and royalty earnings

### For Platform Admins
- Approve/reject film submissions
- Automated royalty distribution (2.5% creator, 1% platform)
- Platform fee collection on all transactions
- Content moderation and quality control
- Analytics and reporting dashboard

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
npm test
```

### Backend API
```bash
cd backend
npm test
```

### Frontend
```bash
npm test
```

## 📚 Documentation

- [Integration Guide](./INTEGRATION_GUIDE.md) - Comprehensive setup guide
- [Smart Contracts](./contracts/README.md) - Contract documentation
- [Backend API](./backend/README.md) - API documentation
- [Frontend Guide](./docs/specification.md) - Frontend specifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the integration guide

## 🔮 Roadmap

- [x] Hybrid onchain/offchain film upload system
- [x] Film approval workflow with admin controls
- [x] NFT minting with royalty distribution
- [x] Creator royalties on primary and secondary sales
- [x] Platform fee collection (1% on transactions)
- [ ] Smart contract deployment to testnet/mainnet
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Social features and reviews
- [ ] Multi-chain support (Lisk, Polygon, etc.)
- [ ] AI-powered content recommendations

---

Built with ❤️ by the QuiFlix team