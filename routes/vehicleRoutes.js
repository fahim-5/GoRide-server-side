import express from 'express';
import {
  getAllVehicles,
  getVehicle,
  getMyVehicles,
  getMyVehiclesByEmail,
  getLatestVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes first
router.get('/latest', getLatestVehicles);
router.get('/my-vehicles', authMiddleware, getMyVehicles);
router.get('/user/:userEmail', getMyVehiclesByEmail);

// Parameterized routes last
router.get('/:id', getVehicle);
router.get('/', getAllVehicles); // This should be absolute last

// Protected routes
router.post('/', authMiddleware, createVehicle);
router.put('/:id', authMiddleware, updateVehicle);
router.delete('/:id', authMiddleware, deleteVehicle);

export default router;