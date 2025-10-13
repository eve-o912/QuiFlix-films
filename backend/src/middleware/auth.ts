import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

interface AuthenticatedRequest extends Request {
  user?: User;
  walletAddress?: string;
}

/**
 * Generate JWT token
 */
export const generateToken = (walletAddress: string, userId: number): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign(
    { walletAddress, userId },
    secret,
    { expiresIn: '7d' }
  );
};

/**
 * Generate message for wallet signing
 */
export const generateSignMessage = (walletAddress: string, timestamp: number): string => {
  return `Sign this message to authenticate with QuiFlix.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
};

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as { walletAddress: string; userId: number };

    // Find user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    req.walletAddress = decoded.walletAddress;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to check if user is a producer
 */
export const requireProducer = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isProducer) {
    return res.status(403).json({ error: 'Producer access required' });
  }
  next();
};
