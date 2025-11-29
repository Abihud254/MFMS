import express from 'express';
import { clearDatabase, promoteToAdmin } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.delete('/clear-database', protect, admin, clearDatabase);
router.put('/promote/:userId', protect, admin, promoteToAdmin);

export default router;
