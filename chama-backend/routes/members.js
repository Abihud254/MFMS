import express from 'express';
import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  updateMemberPhoto
} from '../controllers/memberController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getMembers)
  .post(authorize('admin'), createMember);

router.route('/:id')
  .get(getMember)
  .put(authorize('admin'), updateMember)
  .delete(authorize('admin'), deleteMember);

router.put('/:id/photo', updateMemberPhoto);

export default router;
