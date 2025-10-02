import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  becomeProducer,
  getUserNFTs,
  getUserPurchases,
  getUserViews
} from '../controllers/userController';

const router = Router();

// Public routes (no authentication required with Firebase)
router.get('/profile/:walletAddress', getUserProfile);
router.put('/profile/:walletAddress', updateUserProfile);
router.post('/become-producer/:walletAddress', becomeProducer);
router.get('/nfts/:walletAddress', getUserNFTs);
router.get('/purchases/:walletAddress', getUserPurchases);
router.get('/views/:walletAddress', getUserViews);

export default router;
