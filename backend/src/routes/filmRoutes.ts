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

const router = Router();

// All routes are now public (authentication handled by Firebase + wallet addresses)
router.get('/', getAllFilms);
router.get('/:id', getFilmById);
router.post('/upload', uploadMiddleware, uploadFilm);
router.post('/purchase', purchaseFilm);
router.get('/stream/:tokenId', streamFilm);
router.post('/resell', resellNFT);
router.get('/analytics/:filmId', getFilmAnalytics);
router.get('/producer/revenue/:walletAddress', getProducerRevenue);

export default router;
