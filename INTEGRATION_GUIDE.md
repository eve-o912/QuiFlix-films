# QuiFlix NFT Film Platform - Integration Guide

This guide provides comprehensive instructions for setting up and integrating the QuiFlix NFT film platform with smart contracts, backend APIs, and frontend.

## 🏗️ Architecture Overview

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

## 📋 Prerequisites

- Node.js 18+ (recommended: 22.10.0+)
- PostgreSQL 14+
- IPFS node (optional - can use public gateway)
- Ethereum wallet with Sepolia ETH
- Infura/Alchemy account for RPC access

## 🚀 Quick Start

### 1. Smart Contracts Setup

```bash
cd contracts
npm install
npm run compile
```

**Deploy to Sepolia:**
```bash
# Set environment variables
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
export PRIVATE_KEY="your-private-key-here"
export ETHERSCAN_API_KEY="your-etherscan-api-key"

# Deploy contracts
npm run deploy:sepolia
```

**Deploy locally for testing:**
```bash
npm run deploy:local
```

### 2. Backend Setup

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

### 3. Frontend Integration

The existing Next.js frontend can be integrated with the new backend APIs. Update your API calls to point to the backend server.

## 🔧 Configuration

### Environment Variables

#### Smart Contracts (.env in contracts/)
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your-private-key-here
ETHERSCAN_API_KEY=your-etherscan-api-key
```

#### Backend (.env in backend/)
```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiflix
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Blockchain
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your-private-key-here
NFT_CONTRACT_ADDRESS=0x... # From deployment
CONTENT_CONTRACT_ADDRESS=0x... # From deployment

# IPFS
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# External APIs
LIVEPEER_API_KEY=your-livepeer-api-key
```

## 📡 API Integration

### Authentication Flow

1. **Get Sign Message**
```javascript
const response = await fetch('/api/users/sign-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress: userAddress })
});
const { message } = await response.json();
```

2. **Sign Message with Wallet**
```javascript
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [message, userAddress]
});
```

3. **Authenticate**
```javascript
const response = await fetch('/api/users/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress, signature, message })
});
const { token } = await response.json();
```

### Film Upload (Producer)

```javascript
const formData = new FormData();
formData.append('filmFile', filmFile);
formData.append('thumbnailFile', thumbnailFile);
formData.append('title', 'My Film');
formData.append('description', 'Film description');
formData.append('genre', 'Action');
formData.append('duration', '7200'); // seconds
formData.append('releaseDate', new Date().toISOString());
formData.append('price', '0.01'); // ETH

const response = await fetch('/api/films/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Film Purchase

```javascript
const response = await fetch('/api/films/purchase', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    filmId: 1,
    price: '0.01'
  })
});
```

### Film Streaming

```javascript
const response = await fetch(`/api/films/stream/${tokenId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { streamUrl } = await response.json();
```

## 🔗 Smart Contract Integration

### Contract Addresses

After deployment, update your backend `.env` file with the contract addresses:

```bash
NFT_CONTRACT_ADDRESS=0x... # QuiFlixNFT contract
CONTENT_CONTRACT_ADDRESS=0x... # QuiFlixContent contract
```

### Contract Functions

#### QuiFlixNFT Contract
- `createFilm()` - Create new film NFT
- `purchaseFilm()` - Purchase film NFT
- `ownerOf()` - Check NFT ownership
- `getFilmMetadata()` - Get film metadata
- `royaltyInfo()` - Get royalty information

#### QuiFlixContent Contract
- `createContent()` - Create content entry
- `recordView()` - Record a view
- `distributeRevenue()` - Distribute revenue
- `getContent()` - Get content information

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  email VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  profile_image VARCHAR(255),
  is_producer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Films Table
```sql
CREATE TABLE films (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  genre VARCHAR(50) NOT NULL,
  duration INTEGER NOT NULL,
  release_date TIMESTAMP NOT NULL,
  producer_id INTEGER REFERENCES users(id),
  ipfs_hash VARCHAR(255) NOT NULL,
  price VARCHAR(255) NOT NULL,
  token_id INTEGER UNIQUE,
  contract_address VARCHAR(42),
  is_active BOOLEAN DEFAULT TRUE,
  total_views INTEGER DEFAULT 0,
  total_revenue VARCHAR(255) DEFAULT '0',
  thumbnail_url VARCHAR(255),
  trailer_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Purchases Table
```sql
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER REFERENCES users(id),
  film_id INTEGER REFERENCES films(id),
  token_id INTEGER UNIQUE NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  price VARCHAR(255) NOT NULL,
  gas_used VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Views Table
```sql
CREATE TABLE views (
  id SERIAL PRIMARY KEY,
  viewer_id INTEGER REFERENCES users(id),
  film_id INTEGER REFERENCES films(id),
  duration INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security Considerations

### Wallet Authentication
- Always verify wallet signatures on the backend
- Use nonce/timestamp to prevent replay attacks
- Validate wallet addresses format

### File Upload Security
- Restrict file types and sizes
- Scan uploaded files for malware
- Use IPFS for decentralized storage
- Implement proper access controls

### API Security
- Rate limiting to prevent abuse
- CORS configuration for specific origins
- Input validation and sanitization
- JWT token expiration and refresh

## 📊 Analytics & Monitoring

### Key Metrics to Track
- Film uploads and purchases
- User engagement (views, completion rates)
- Revenue distribution
- NFT trading volume
- Platform fees collected

### Monitoring Setup
- Database query performance
- API response times
- Blockchain transaction success rates
- IPFS upload/download speeds
- Error rates and types

## 🚀 Deployment

### Production Checklist

1. **Smart Contracts**
   - [ ] Deploy to mainnet
   - [ ] Verify contracts on Etherscan
   - [ ] Update contract addresses in backend

2. **Backend**
   - [ ] Set production environment variables
   - [ ] Configure SSL certificates
   - [ ] Set up database backups
   - [ ] Configure load balancing
   - [ ] Set up monitoring and logging

3. **Frontend**
   - [ ] Update API endpoints
   - [ ] Configure production build
   - [ ] Set up CDN for static assets
   - [ ] Implement error tracking

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: quiflix
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=quiflix
      - DB_USER=postgres
      - DB_PASSWORD=password
    depends_on:
      - postgres

  frontend:
    build: ./app
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npm test
```

### Backend API Tests
```bash
cd backend
npm test
```

### Integration Tests
- Test complete user flow: sign up → upload film → purchase → stream
- Test producer dashboard functionality
- Test NFT resale functionality
- Test analytics and reporting

## 🔧 Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check RPC URL and private key
   - Ensure sufficient ETH for gas
   - Verify network connectivity

2. **Database Connection Issues**
   - Check PostgreSQL is running
   - Verify connection credentials
   - Check firewall settings

3. **IPFS Upload Fails**
   - Check IPFS node is running
   - Verify file size limits
   - Check network connectivity

4. **Authentication Issues**
   - Verify wallet signature format
   - Check JWT secret configuration
   - Ensure proper message formatting

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development DEBUG=* npm run dev
```

## 📚 Additional Resources

- [Ethereum Documentation](https://ethereum.org/developers/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

For additional support, please refer to the individual README files in each directory or create an issue in the repository.
