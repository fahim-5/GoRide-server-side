import express from 'express';
import {
  createBooking,
  getBookingsByUser,
  getAllBookings,
  deleteBooking,
  getBookingById,
  updateBooking
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllBookings);
router.get('/user/:userEmail', authMiddleware, getBookingsByUser);
router.get('/:id', authMiddleware, getBookingById);
router.post('/', authMiddleware, createBooking);
router.put('/:id', authMiddleware, updateBooking);
router.delete('/:id', authMiddleware, deleteBooking);

export default router;