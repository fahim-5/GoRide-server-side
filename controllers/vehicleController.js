import { Vehicle } from '../models/index.js';

export const getAllVehicles = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, availability } = req.query;
    
    let filter = {};
    
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (availability) filter.availability = availability;
    
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyVehicles = async (req, res) => {
  try {
    const { userEmail } = req.params;
    
    const vehicles = await Vehicle.find({ userEmail }).sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLatestVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .sort({ createdAt: -1 })
      .limit(6);
    
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    if (vehicle.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }
    
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    if (vehicle.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }
    
    await Vehicle.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};