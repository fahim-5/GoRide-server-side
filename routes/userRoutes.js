import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.get('/', authMiddleware, getAllUsers);

export default router;