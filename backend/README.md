# QuiFlix Backend API

A comprehensive backend API for the QuiFlix NFT film streaming platform.

## Features

- **NFT Film Management**: Upload, purchase, and stream films as NFTs
- **Blockchain Integration**: Smart contract interaction for NFT minting and ownership
- **IPFS Storage**: Decentralized file storage for films and metadata
- **User Authentication**: Wallet-based authentication with JWT tokens
- **Producer Dashboard**: Revenue tracking and analytics for content creators
- **Secondary Market**: NFT resale functionality
- **Analytics**: View tracking and revenue reporting

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Blockchain**: Ethereum (Sepolia testnet) with ethers.js
- **Storage**: IPFS for decentralized file storage
- **Authentication**: JWT + Wallet signature verification
- **Caching**: Redis (optional)

## API Endpoints

### Authentication
- `POST /api/users/sign-message` - Get message for wallet signing
- `POST /api/users/authenticate` - Authenticate with wallet signature

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/become-producer` - Become a content producer
- `GET /api/users/nfts` - Get user's NFTs
- `GET /api/users/purchases` - Get user's purchases
- `GET /api/users/views` - Get user's viewing history

### Film Management
- `GET /api/films` - Get all films (public)
- `GET /api/films/:id` - Get film by ID (public)
- `POST /api/films/upload` - Upload new film (producer only)
- `POST /api/films/purchase` - Purchase film NFT
- `GET /api/films/stream/:tokenId` - Stream film (NFT owner only)
- `POST /api/films/resell` - Resell NFT
- `GET /api/films/analytics/:filmId` - Get film analytics (producer only)
- `GET /api/films/producer/revenue` - Get producer revenue report

## Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiflix
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Blockchain Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your-private-key-here
NFT_CONTRACT_ADDRESS=0x...
CONTENT_CONTRACT_ADDRESS=0x...

# IPFS Configuration
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# External APIs
LIVEPEER_API_KEY=your-livepeer-api-key
LIVEPEER_GATEWAY_URL=https://livepeer.com/api/

# File Upload
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
createdb quiflix
```

3. Set up IPFS node (optional, can use public gateway):
```bash
# Install IPFS
npm install -g ipfs

# Initialize and start IPFS
ipfs init
ipfs daemon
```

4. Copy environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

5. Start development server:
```bash
npm run dev
```

## Database Schema

### Users Table
- `id` (Primary Key)
- `walletAddress` (Unique)
- `email` (Optional)
- `username` (Optional, Unique)
- `profileImage` (Optional)
- `isProducer` (Boolean)
- `createdAt`, `updatedAt`

### Films Table
- `id` (Primary Key)
- `title`
- `description`
- `genre`
- `duration` (seconds)
- `releaseDate`
- `producerId` (Foreign Key)
- `ipfsHash`
- `price` (wei as string)
- `tokenId` (NFT token ID)
- `contractAddress`
- `isActive`
- `totalViews`
- `totalRevenue` (wei as string)
- `thumbnailUrl`
- `trailerUrl`
- `createdAt`, `updatedAt`

### Purchases Table
- `id` (Primary Key)
- `buyerId` (Foreign Key)
- `filmId` (Foreign Key)
- `tokenId` (Unique)
- `transactionHash`
- `price` (wei as string)
- `gasUsed`
- `createdAt`, `updatedAt`

### Views Table
- `id` (Primary Key)
- `viewerId` (Foreign Key)
- `filmId` (Foreign Key)
- `duration` (seconds)
- `completed` (Boolean)
- `createdAt`, `updatedAt`

## Smart Contract Integration

The backend integrates with two main smart contracts:

1. **QuiFlixNFT**: Handles NFT creation, purchase, and ownership
2. **QuiFlixContent**: Manages content metadata and revenue distribution

### Contract Functions Used

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

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Joi validation for request data
- **File Upload Security**: Type and size restrictions
- **Wallet Signature Verification**: Cryptographic authentication

## Performance Optimizations

- **Compression**: Gzip compression for responses
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **File Streaming**: Efficient file upload/download
- **Connection Pooling**: Database connection optimization

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Database Migrations
```bash
npm run db:migrate
```

### Code Style
The project uses TypeScript with strict type checking. Follow these guidelines:
- Use interfaces for type definitions
- Implement proper error handling
- Add JSDoc comments for functions
- Use async/await for asynchronous operations

## Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Start the server:
```bash
npm start
```

For production deployment, consider using:
- PM2 for process management
- Nginx for reverse proxy
- SSL certificates for HTTPS
- Database connection pooling
- Redis for caching
- Load balancers for scaling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
