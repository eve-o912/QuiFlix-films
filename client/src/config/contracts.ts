// QuiFlix Smart Contract ABIs and Addresses

export const QUIFLIX_NFT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
    "name": "purchaseFilm",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
    "name": "getFilmMetadata",
    "outputs": [{
      "components": [
        {"internalType": "string", "name": "title", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string", "name": "genre", "type": "string"},
        {"internalType": "uint256", "name": "duration", "type": "uint256"},
        {"internalType": "uint256", "name": "releaseDate", "type": "uint256"},
        {"internalType": "address", "name": "producer", "type": "address"},
        {"internalType": "string", "name": "ipfsHash", "type": "string"},
        {"internalType": "uint256", "name": "price", "type": "uint256"},
        {"internalType": "bool", "name": "isActive", "type": "bool"}
      ],
      "internalType": "struct QuiFlixNFT.FilmMetadata",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const QUIFLIX_CONTENT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_contentId", "type": "uint256"}],
    "name": "distributeRevenue",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_contentId", "type": "uint256"}],
    "name": "getContent",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "contentId", "type": "uint256"},
        {"internalType": "string", "name": "title", "type": "string"},
        {"internalType": "string", "name": "ipfsHash", "type": "string"},
        {"internalType": "address", "name": "producer", "type": "address"},
        {"internalType": "uint256", "name": "totalRevenue", "type": "uint256"},
        {"internalType": "uint256", "name": "totalViews", "type": "uint256"},
        {"internalType": "bool", "name": "isActive", "type": "bool"},
        {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
      ],
      "internalType": "struct QuiFlixContent.Content",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract Addresses (Replace with your deployed contract addresses)
export const CONTRACT_ADDRESSES = {
  base: {
    nft: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    content: '0x0000000000000000000000000000000000000000', // Replace with deployed address
  },
  lisk: {
    nft: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    content: '0x0000000000000000000000000000000000000000', // Replace with deployed address
  },
  scroll: {
    nft: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    content: '0x0000000000000000000000000000000000000000', // Replace with deployed address
  },
  celo: {
    nft: '0x0000000000000000000000000000000000000000', // Replace with deployed address
    content: '0x0000000000000000000000000000000000000000', // Replace with deployed address
  },
} as const;
