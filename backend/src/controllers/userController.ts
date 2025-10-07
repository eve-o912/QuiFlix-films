import { Request, Response } from 'express';
import blockchainService from '../services/blockchainService';
import { generateToken, generateSignMessage } from '../middleware/auth';

// Instead of importing User model, define a simple interface:
interface User {
  id: string;
  email: string;
  walletAddress?: string;
  username?: string;
  isProducer?: boolean;
  profileImage?: string;
  createdAt?: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  walletAddress?: string;
}

// Simple in-memory user storage (replace with Firebase later)
const users: Map<string, User> = new Map();

/**
 * Register/Login user with wallet signature
 */
export const authenticateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const isValid = await blockchainService.verifySignature(message, signature, walletAddress);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user (using in-memory storage for now)
    let user = users.get(walletAddress);
    
    if (!user) {
      user = {
        id: Date.now().toString(),
        email: '', // Placeholder email since it's required by the User interface
        walletAddress,
        isProducer: false,
        createdAt: new Date().toISOString()
      };
      users.set(walletAddress, user as User);
    }

    // Ensure user is defined before generating JWT token
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const token = generateToken(user.id, walletAddress);

    res.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        isProducer: user.isProducer,
        profileImage: user.profileImage
      },
      token
    });
    return;

  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Failed to authenticate user' });
    return;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    res.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        isProducer: user.isProducer,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, email, profileImage } = req.body;
    const user = req.user!;

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = Array.from(users.values()).find(u => u.username === username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update user in memory storage
    const updatedUser = {
      ...user,
      username: username || user.username,
      email: email || user.email,
      profileImage: profileImage || user.profileImage
    };
    
    if (user.walletAddress) {
      users.set(user.walletAddress, updatedUser);
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        walletAddress: updatedUser.walletAddress,
        username: updatedUser.username,
        email: updatedUser.email,
        isProducer: updatedUser.isProducer,
        profileImage: updatedUser.profileImage
      }
    });
    return;

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
    return;
  }
};

/**
 * Become a producer
 */
export const becomeProducer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    if (user.isProducer) {
      return res.status(400).json({ error: 'User is already a producer' });
    }

    // Update user in memory storage
    const updatedUser = { ...user, isProducer: true };
    if (user.walletAddress) {
      users.set(user.walletAddress, updatedUser);
    }

    res.json({
      success: true,
      message: 'Successfully became a producer',
      user: {
        id: updatedUser.id,
        walletAddress: updatedUser.walletAddress,
        username: updatedUser.username,
        isProducer: true
      }
    });
    return;

  } catch (error) {
    console.error('Error becoming producer:', error);
    res.status(500).json({ error: 'Failed to become producer' });
    return;
  }
};

/**
 * Get user's NFTs
 */
export const getUserNFTs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;

    // This would typically query the blockchain for NFTs owned by the user
    // For now, we'll return a placeholder response
    res.json({
      success: true,
      nfts: [],
      message: 'NFT querying not implemented yet'
    });

  } catch (error) {
    console.error('Error getting user NFTs:', error);
    res.status(500).json({ error: 'Failed to get user NFTs' });
  }
};

/**
 * Get user's purchases
 */
export const getUserPurchases = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 10 } = req.query;

    // Since we removed the database, return empty purchases for now
    // You can integrate with Firebase to store purchase data
    res.json({
      success: true,
      purchases: [],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      },
      message: 'Purchase history will be available once Firebase integration is complete'
    });
    return;

  } catch (error) {
    console.error('Error getting user purchases:', error);
    res.status(500).json({ error: 'Failed to get user purchases' });
  }
};

/**
 * Get user's views
 */
export const getUserViews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 10 } = req.query;

    // Since we removed the database, return empty views for now
    // You can integrate with Firebase to store view data
    res.json({
      success: true,
      views: [],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      },
      message: 'View history will be available once Firebase integration is complete'
    });
    return;

  } catch (error) {
    console.error('Error getting user views:', error);
    res.status(500).json({ error: 'Failed to get user views' });
  }
};

/**
 * Generate message for wallet signing
 */
export const getSignMessage = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const message = generateSignMessage(walletAddress);

    res.json({
      success: true,
      message,
      timestamp: Date.now()
    });
    return;

  } catch (error) {
    console.error('Error generating sign message:', error);
    res.status(500).json({ error: 'Failed to generate sign message' });
    return;
  }
};