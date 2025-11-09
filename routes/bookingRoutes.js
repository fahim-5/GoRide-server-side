import express from 'express';
import {
  createBooking,
  getBookingsByUser,
  getAllBookings,
  cancelBooking
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllBookings);
router.get('/user/:userEmail', authMiddleware, getBookingsByUser);
router.post('/', authMiddleware, createBooking);
router.delete('/:id', authMiddleware, cancelBooking);

export default router;