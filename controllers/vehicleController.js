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
    console.error('Error fetching all vehicles:', error); 
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
    console.error('Error fetching single vehicle:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Invalid vehicle ID' });
    }
    res.status(500).json({ message: error.message });
  }
};


export const getMyVehicles = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    console.log('Fetching vehicles for authenticated user:', userEmail);
    
    const vehicles = await Vehicle.find({ userEmail }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    console.error('Error fetching user vehicles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching your vehicles' 
    });
  }
};


export const getMyVehiclesByEmail = async (req, res) => {
  try {
    const { userEmail } = req.params;
    
    console.log('Fetching vehicles for user (legacy):', userEmail);
    
    const vehicles = await Vehicle.find({ userEmail }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    console.error('Error fetching user vehicles (legacy):', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};


export const getLatestVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .sort({ createdAt: -1 })
      .limit(6); 
    
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching latest vehicles:', error);
    res.status(500).json({ message: error.message });
  }
};


export const createVehicle = async (req, res) => {
  try {
    const vehicleData = {
        ...req.body,
        userEmail: req.user.email 
    };
    
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(400).json({ message: error.message });
  }
};


export const updateVehicle = async (req, res) => {
  try {
    console.log('🔄 Update Vehicle Request:', {
      vehicleId: req.params.id,
      authenticatedUser: req.user ? req.user.email : 'No user',
      userData: req.user
    });

    if (!req.user || !req.user.email) {
      console.log('❌ No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      console.log('❌ Vehicle not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    console.log('📋 Vehicle found:', {
      vehicleId: vehicle._id,
      vehicleOwner: vehicle.userEmail,
      authenticatedUser: req.user.email,
      isOwner: vehicle.userEmail === req.user.email
    });
    
    if (vehicle.userEmail !== req.user.email) {
      console.log('🚫 Authorization failed:', {
        vehicleOwner: vehicle.userEmail,
        authenticatedUser: req.user.email,
        match: vehicle.userEmail === req.user.email
      });
      return res.status(403).json({ message: 'Not authorized to update this vehicle. You can only update your own vehicles.' });
    }
    
    if (req.body.userEmail) {
        delete req.body.userEmail;
    }
    
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log('✅ Vehicle updated successfully:', updatedVehicle._id);
    
    res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('❌ Error updating vehicle:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid vehicle ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error during vehicle update' });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    console.log('🗑️ Delete Vehicle Request:', {
      vehicleId: req.params.id,
      authenticatedUser: req.user ? req.user.email : 'No user'
    });

    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    if (vehicle.userEmail !== req.user.email) {
      console.log('🚫 Delete authorization failed:', {
        vehicleOwner: vehicle.userEmail,
        authenticatedUser: req.user.email
      });
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }
    
    await Vehicle.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: error.message });
  }
};