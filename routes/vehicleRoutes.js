import express from 'express';
import {
  getAllVehicles,
  getVehicle,
  getMyVehicles,
  getLatestVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllVehicles);
router.get('/latest', getLatestVehicles);
router.get('/:id', getVehicle);
router.get('/user/:userEmail', getMyVehicles);

router.post('/', authMiddleware, createVehicle);
router.put('/:id', authMiddleware, updateVehicle);
router.delete('/:id', authMiddleware, deleteVehicle);

export default router;