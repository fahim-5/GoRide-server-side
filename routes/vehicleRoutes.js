import express from 'express';
import {
  getAllVehicles,
  getVehicle,
  getMyVehicles,          // For /my-vehicles (authenticated)
  getMyVehiclesByEmail,   // For /user/:userEmail (public)
  getLatestVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Correct route order - specific routes first
router.get('/', getAllVehicles);
router.get('/latest', getLatestVehicles);
router.get('/my-vehicles', authMiddleware, getMyVehicles); // Authenticated endpoint
router.get('/user/:userEmail', getMyVehiclesByEmail);      // Public endpoint (backward compatibility)

// Parameterized routes last
router.get('/:id', getVehicle);

// Protected routes
router.post('/', authMiddleware, createVehicle);
router.put('/:id', authMiddleware, updateVehicle);
router.delete('/:id', authMiddleware, deleteVehicle);

export default router;