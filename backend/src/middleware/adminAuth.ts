import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

const ADMIN_WALLET_ADDRESS = process.env.ADMIN_ADDRESS || '';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    walletAddress?: string;
    [key: string]: any;
  };
}

/**
 * Middleware to check if user is an admin using Firebase JWT and wallet address claim
*/
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.substring(7);

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Look for common wallet address claim names
    const walletAddress =
      (decodedToken as { [key: string]: any }).walletAddress ||
      (decodedToken as { [key: string]: any }).wallet ||
      (decodedToken as { [key: string]: any }).ethAddress ||
      (decodedToken as { [key: string]: any }).ethereumAddress;

    if (!walletAddress || String(walletAddress).toLowerCase() !== ADMIN_WALLET_ADDRESS.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const { uid, ...otherClaims } = decodedToken as { [key: string]: any };
    req.user = {
      uid,
      walletAddress: String(walletAddress),
      ...otherClaims
    };

    return next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};