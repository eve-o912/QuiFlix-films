import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import blockchainService from '../services/blockchainService';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: User;
  walletAddress?: string;
}

interface JWTPayload {
  walletAddress: string;
  userId: number;
  iat: number;
  exp: number;
}

/**
 * Middleware to verify JWT token
 */
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Find user in database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    req.walletAddress = decoded.walletAddress;
    next();
    return;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
    return;
  }
};

/**
 * Middleware to verify wallet signature
 */
export const verifyWalletSignature = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { signature, message, walletAddress } = req.body;
    
    if (!signature || !message || !walletAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: signature, message, walletAddress' 
      });
    }

    const isValid = await blockchainService.verifySignature(message, signature, walletAddress);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid wallet signature.' });
    }

    req.walletAddress = walletAddress;
    next();
    return;
  } catch (error) {
    res.status(401).json({ error: 'Failed to verify wallet signature.' });
    return;
  }
};

/**
 * Middleware to verify NFT ownership
 */
export const verifyNFTOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { tokenId } = req.params;
    const walletAddress = req.walletAddress || req.user?.walletAddress;
    
    if (!walletAddress) {
      return res.status(401).json({ error: 'Wallet address required.' });
    }

    const owner = await blockchainService.getNFTOwner(parseInt(tokenId));
    
    if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'You do not own this NFT.' });
    }

    next();
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify NFT ownership.' });
    return;
  }
};

/**
 * Middleware to check if user is producer
 */
export const requireProducer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!req.user.isProducer) {
      return res.status(403).json({ error: 'Producer access required.' });
    }

    next();
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify producer status.' });
    return;
  }
};

/**
 * Generate JWT token
 */
export const generateToken = (walletAddress: string, userId: number): string => {
  return jwt.sign(
    { walletAddress, userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );
};

/**
 * Generate message for wallet signing
 */
export const generateSignMessage = (walletAddress: string, timestamp: number): string => {
  return `QuiFlix Authentication\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
};
