import { Vehicle } from '../models/index.js';

/**
 * @desc Get all vehicles with filtering, sorting, and price range
 * @route GET /api/vehicles
 * @access Public
 */
export const getAllVehicles = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, availability } = req.query;
    
    let filter = {};
    
    // Filtering by Category (Exact Match)
    if (category) filter.category = category;
    
    // Filtering by Location (Case-Insensitive Regex Search)
    if (location) filter.location = { $regex: location, $options: 'i' };
    
    // Filtering by Availability (Exact Match)
    if (availability) filter.availability = availability;
    
    // Filtering by Price Range
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      // $gte: Greater than or equal to
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      // $lte: Less than or equal to
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    // Default sort by newest first (as implemented in your original code)
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (error) {
    // Log the full error on the server side for debugging
    console.error('Error fetching all vehicles:', error); 
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get single vehicle by ID
 * @route GET /api/vehicles/:id
 * @access Public
 */
export const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error fetching single vehicle:', error);
    // Use 404 for bad ObjectId format to hide database implementation details
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Invalid vehicle ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get vehicles for the currently authenticated user
 * @route GET /api/vehicles/my-vehicles
 * @access Private
 */
export const getMyVehicles = async (req, res) => {
  try {
    // Get user email from the authenticated user (from authMiddleware)
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

/**
 * @desc Get vehicles owned by a specific user (for backward compatibility)
 * @route GET /api/vehicles/user/:userEmail
 * @access Public
 */
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

/**
 * @desc Get the 6 latest vehicles added
 * @route GET /api/vehicles/latest
 * @access Public
 */
export const getLatestVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .sort({ createdAt: -1 })
      .limit(6); // As per project requirements
    
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching latest vehicles:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Create a new vehicle listing
 * @route POST /api/vehicles
 * @access Private (Auth Middleware required)
 */
export const createVehicle = async (req, res) => {
  try {
    // Use a spread operator to get data and explicitly override userEmail 
    // with the email from the authenticated token (req.user.email) for security.
    const vehicleData = {
        ...req.body,
        userEmail: req.user.email // Ensure the vehicle owner is the logged-in user
    };
    
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    // 400 status for validation/schema errors
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Update an existing vehicle listing
 * @route PUT /api/vehicles/:id
 * @access Private (Auth Middleware required)
 */
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Authorization Check: Only the owner (based on userEmail) can update the vehicle.
    if (vehicle.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }
    
    // Prevents accidental overwrite of owner email on update payload
    if (req.body.userEmail) {
        delete req.body.userEmail;
    }
    
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // { new: true } returns the updated document, { runValidators: true } ensures schema validation runs
    );
    
    res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc Delete a vehicle listing
 * @route DELETE /api/vehicles/:id
 * @access Private (Auth Middleware required)
 */
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    // Authorization Check: Only the owner (based on userEmail) can delete the vehicle.
    if (vehicle.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }
    
    await Vehicle.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: error.message });
  }
};