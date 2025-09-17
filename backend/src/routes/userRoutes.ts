import { Router } from 'express';
import {
  authenticateUser,
  getUserProfile,
  updateUserProfile,
  becomeProducer,
  getUserNFTs,
  getUserPurchases,
  getUserViews,
  getSignMessage
} from '../controllers/userController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/sign-message', getSignMessage);
router.post('/authenticate', authenticateUser);

// Protected routes
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);
router.post('/become-producer', verifyToken, becomeProducer);
router.get('/nfts', verifyToken, getUserNFTs);
router.get('/purchases', verifyToken, getUserPurchases);
router.get('/views', verifyToken, getUserViews);

export default router;
