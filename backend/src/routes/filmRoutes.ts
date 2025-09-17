import { Router } from 'express';
import {
  uploadFilm,
  purchaseFilm,
  streamFilm,
  resellNFT,
  getFilmAnalytics,
  getProducerRevenue,
  getAllFilms,
  getFilmById,
  uploadMiddleware
} from '../controllers/filmController';
import { verifyToken, verifyWalletSignature, requireProducer } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllFilms);
router.get('/:id', getFilmById);

// Protected routes
router.post('/upload', verifyToken, requireProducer, uploadMiddleware, uploadFilm);
router.post('/purchase', verifyToken, purchaseFilm);
router.get('/stream/:tokenId', verifyToken, streamFilm);
router.post('/resell', verifyToken, resellNFT);
router.get('/analytics/:filmId', verifyToken, getFilmAnalytics);
router.get('/producer/revenue', verifyToken, requireProducer, getProducerRevenue);

export default router;
