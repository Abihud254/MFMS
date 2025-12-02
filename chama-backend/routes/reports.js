import express from 'express';
import { getFinancialSummary, getShareReport, getLoanPerformanceReport, getTrendsReport } from '../controllers/reportsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/financial-summary', protect, getFinancialSummary);
router.get('/shares', protect, getShareReport);
router.get('/loan-performance', protect, getLoanPerformanceReport);
router.get('/trends', protect, getTrendsReport);

export default router;
