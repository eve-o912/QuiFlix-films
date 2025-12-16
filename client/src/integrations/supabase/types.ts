// Firebase Firestore types
// These mirror the Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export enum FilmStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum PurchaseType {
  NFT = 'nft',
  DIRECT = 'direct',
  INVESTMENT = 'investment'
}

// Collection Types
export interface CustodialWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  encrypted_private_key: string;
  network: string;
  created_at: string | null;
}

export interface Earning {
  id: string;
  user_id: string;
  film_id: string;
  amount: number;
  source: string;
  tx_hash: string | null;
  claimed: boolean | null;
  created_at: string | null;
}

export interface Film {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  director: string | null;
  duration_minutes: number | null;
  release_year: number | null;
  poster_url: string | null;
  trailer_url: string | null;
  film_url: string | null;
  direct_price: number | null;
  nft_price: number | null;
  investment_price_per_share: number | null;
  total_shares: number | null;
  available_shares: number | null;
  creator_revenue_share: number | null;
  investor_revenue_share: number | null;
  platform_fee: number | null;
  views: number | null;
  rating: number | null;
  total_earnings: number | null;
  status: FilmStatus | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Investment {
  id: string;
  investor_id: string;
  film_id: string;
  shares_owned: number;
  amount_invested: number;
  earnings_claimed: number | null;
  tx_hash: string | null;
  created_at: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Purchase {
  id: string;
  user_id: string;
  film_id: string;
  purchase_type: PurchaseType;
  amount: number;
  currency: string | null;
  network: string;
  tx_hash: string | null;
  created_at: string | null;
}

// Insert types (for creating new documents)
export type CustodialWalletInsert = Omit<CustodialWallet, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string | null;
};

export type EarningInsert = Omit<Earning, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string | null;
  claimed?: boolean | null;
};

export type FilmInsert = Omit<Film, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type InvestmentInsert = Omit<Investment, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string | null;
  earnings_claimed?: number | null;
};

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string | null;
  updated_at?: string | null;
};

export type PurchaseInsert = Omit<Purchase, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string | null;
};

// Update types (for updating existing documents)
export type CustodialWalletUpdate = Partial<Omit<CustodialWallet, 'id'>>;
export type EarningUpdate = Partial<Omit<Earning, 'id'>>;
export type FilmUpdate = Partial<Omit<Film, 'id'>>;
export type InvestmentUpdate = Partial<Omit<Investment, 'id'>>;
export type ProfileUpdate = Partial<Omit<Profile, 'id'>>;
export type PurchaseUpdate = Partial<Omit<Purchase, 'id'>>;

// Joined types (for queries with relations)
export interface InvestmentWithFilm extends Investment {
  film: Film | null;
}

export interface PurchaseWithFilm extends Purchase {
  film: Film | null;
}

export interface EarningWithFilm extends Earning {
  film: {
    title: string;
  } | null;
}

// Constants
export const Constants = {
  Enums: {
    FilmStatus: ['draft', 'pending', 'approved', 'rejected'] as const,
    PurchaseType: ['nft', 'direct', 'investment'] as const,
  },
} as const;