import { Router } from 'express';
import {
  uploadFilm,
  purchaseFilm,
  streamFilm,
  resellNFT,
  approveFilm,
  getFilmAnalytics,
  getProducerRevenue,
  getAllFilms,
  getFilmById,
  getProducerFilms,
  uploadMiddleware
} from '../controllers/filmController';
import { authenticateToken, requireProducer } from '../middleware/auth';

const router = Router();

// All routes are now public (authentication handled by Firebase + wallet addresses)
router.get('/', getAllFilms);
router.get('/:id', getFilmById);
router.post('/upload', authenticateToken, uploadMiddleware, uploadFilm);
router.post('/approve', approveFilm);
router.post('/purchase', purchaseFilm);
router.get('/stream/:tokenId', streamFilm);
router.post('/resell', resellNFT);
router.get('/analytics/:filmId', getFilmAnalytics);
router.get('/producer/revenue/:walletAddress', getProducerRevenue);
router.get('/producer/films', authenticateToken, requireProducer, getProducerFilms);

export default router;
