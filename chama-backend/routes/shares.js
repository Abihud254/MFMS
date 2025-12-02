import express from 'express';
import {
  getShares,
  getShare,
  createShare,
  updateShare,
  deleteShare,
  getMemberShares,
  getShareStats
} from '../controllers/shareController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getShares)
  .post(authorize('admin'), createShare);

router.get('/stats', getShareStats);
router.get('/member/:memberId', getMemberShares);

router.route('/:id')
  .get(getShare)
  .put(authorize('admin'), updateShare)
  .delete(authorize('admin'), deleteShare);

export default router;
