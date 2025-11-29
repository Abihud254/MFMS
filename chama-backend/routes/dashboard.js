import express from 'express';
import { getDashboardStats, getRecentActivities } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getDashboardStats);
router.get('/recent-activities', protect, getRecentActivities);

export default router;