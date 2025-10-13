import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import blockchainService from '../services/blockchainService';
import { generateToken, generateSignMessage } from '../middleware/auth.js';

interface AuthenticatedRequest extends Request {
  user?: User;
  walletAddress?: string;
}

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

    // Find or create user
    let user = await User.findOne({ where: { walletAddress } });
    
    if (!user) {
      user = await User.create({
        walletAddress,
        isProducer: false
      });
    }

    // Generate JWT token
    const token = generateToken(walletAddress, user.id);

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
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update user
    await user.update({
      username: username || user.username,
      email: email || user.email,
      profileImage: profileImage || user.profileImage
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        isProducer: user.isProducer,
        profileImage: user.profileImage
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

    await user.update({ isProducer: true });

    res.json({
      success: true,
      message: 'Successfully became a producer',
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
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

    const purchases = await user.getPurchases({
      include: [
        {
          model: require('../models/Film').default,
          as: 'film',
          include: [
            {
              model: User,
              as: 'producer',
              attributes: ['walletAddress', 'username']
            }
          ]
        }
      ],
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      purchases,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      }
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

    const views = await user.getViews({
      include: [
        {
          model: require('../models/Film').default,
          as: 'film',
          include: [
            {
              model: User,
              as: 'producer',
              attributes: ['walletAddress', 'username']
            }
          ]
        }
      ],
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      views,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      }
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

    const timestamp = Date.now();
    const message = generateSignMessage(walletAddress, timestamp);

    res.json({
      success: true,
      message,
      timestamp
    });
    return;

  } catch (error) {
    console.error('Error generating sign message:', error);
    res.status(500).json({ error: 'Failed to generate sign message' });
    return;
  }
};
