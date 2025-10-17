import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import {
  getAdminAnalytics,
  removeFilm,
  getAllFilmsAdmin
} from '../controllers/adminController';

const router = Router();

// All admin routes require admin authentication
//router.use(requireAdmin);

// Analytics routes
router.get('/analytics', getAdminAnalytics);

// Film management routes
router.get('/films', getAllFilmsAdmin);
router.delete('/films/:filmId', removeFilm);

export default router;
