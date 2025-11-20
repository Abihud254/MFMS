import express from 'express';
import {
  getContributions,
  getContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getMemberContributions,
  getContributionStats
} from '../controllers/contributionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getContributions)
  .post(authorize('admin'), createContribution);

router.get('/stats', getContributionStats);
router.get('/member/:memberId', getMemberContributions);

router.route('/:id')
  .get(getContribution)
  .put(authorize('admin'), updateContribution)
  .delete(authorize('admin'), deleteContribution);

export default router;
