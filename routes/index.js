import express from 'express';
import authRoutes from './authRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);

export default router;