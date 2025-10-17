// Shared storage for in-memory data across controllers
// In production, this should be replaced with proper database storage

export interface User {
  id: string;
  email: string;
  walletAddress?: string;
  username?: string;
  isProducer?: boolean;
  profileImage?: string;
  createdAt?: string;
}

export interface Film {
  id: string;
  title: string;
  description: string;
  genre: string;
  duration: number;
  releaseDate: string;
  producerId: string;
  ipfsHash: string;
  price: string;
  thumbnailUrl?: string;
  isActive: boolean;
  totalViews: number;
  totalRevenue: string;
  tokenId?: number;
  createdAt: string;
}

export interface Purchase {
  id: string;
  buyerId: string;
  filmId: string;
  tokenId: number;
  transactionHash: string;
  price: string;
  gasUsed: string;
  createdAt: string;
}

export interface View {
  id: string;
  viewerId: string;
  filmId: string;
  duration: number;
  completed: boolean;
  createdAt: string;
}

// Shared storage instances
export const filmsStorage: Map<string, Film> = new Map();
export const purchasesStorage: Map<string, Purchase> = new Map();
export const viewsStorage: Map<string, View> = new Map();
export const usersStorage: Map<string, User> = new Map();