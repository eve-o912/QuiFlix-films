# QuiFlix - NFT Film Streaming Platform

A decentralized film streaming platform where users can purchase, own, and trade films as NFTs. Built with Next.js, Express.js, PostgreSQL, and Ethereum smart contracts.

## 🎬 Features

- **NFT Film Ownership**: Purchase films as NFTs with blockchain ownership
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
- ERC-721 NFT standard
- EIP-2981 royalty support
- Film metadata storage
- Purchase and resale functionality

### QuiFlixContent Contract
- Content management
- Revenue distribution
- View tracking
- Producer royalty splits

## 📡 API Endpoints

### Authentication
- `POST /api/users/sign-message` - Get message for wallet signing
- `POST /api/users/authenticate` - Authenticate with wallet signature

### Film Management
- `GET /api/films` - Get all films
- `POST /api/films/upload` - Upload new film (producer only)
- `POST /api/films/purchase` - Purchase film NFT
- `GET /api/films/stream/:tokenId` - Stream film (NFT owner only)
- `POST /api/films/resell` - Resell NFT

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

## 📊 Key Features

### For Users
- Browse and discover films
- Purchase films as NFTs
- Stream owned content
- Trade NFTs on secondary market
- Track viewing history

### For Producers
- Upload films with metadata
- Set pricing and royalties
- Track revenue and analytics
- Manage content library
- View audience engagement

### For Platform
- Automated royalty distribution
- Platform fee collection
- Content moderation tools
- Analytics and reporting
- Revenue optimization

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

- [ ] Mainnet deployment
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Social features and reviews
- [ ] Multi-chain support
- [ ] AI-powered content recommendations

---

Built with ❤️ by the QuiFlix team