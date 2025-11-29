import express from 'express';
import { getFinancialSummary, getContributionReport } from '../controllers/reportsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/financial-summary', protect, getFinancialSummary);
router.get('/contributions', protect, getContributionReport);

export default router;
