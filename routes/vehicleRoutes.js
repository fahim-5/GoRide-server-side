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

router.get('/latest', getLatestVehicles);
router.get('/my-vehicles', authMiddleware, getMyVehicles);
router.get('/user/:userEmail', getMyVehiclesByEmail);

router.get('/:id', getVehicle);
router.get('/', getAllVehicles); 

router.post('/', authMiddleware, createVehicle);
router.put('/:id', authMiddleware, updateVehicle);
router.delete('/:id', authMiddleware, deleteVehicle);

export default router;