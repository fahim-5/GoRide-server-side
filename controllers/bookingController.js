import { Booking, Vehicle } from '../models/index.js';

/**
 * @desc Create a new booking
 * @route POST /api/bookings
 * @access Private
 */
export const createBooking = async (req, res) => {
  try {
    const { vehicleId, userEmail, startDate, endDate, notes } = req.body;

    // Basic validation
    if (!vehicleId || !userEmail || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check vehicle availability
    if (vehicle.availability !== 'Available') {
      return res.status(400).json({ message: 'Vehicle is not available' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Basic date validation
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Calculate price
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * vehicle.pricePerDay;

    // Create booking
    const booking = new Booking({
      vehicleId,
      userEmail,
      startDate: start,
      endDate: end,
      totalPrice,
      notes: notes || '',
      status: 'confirmed'
    });

    await booking.save();

    // Update vehicle availability
    vehicle.availability = 'Booked';
    await vehicle.save();

    // Return booking with vehicle details
    const populatedBooking = await Booking.findById(booking._id).populate('vehicleId');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get bookings for a specific user
 * @route GET /api/bookings/user/:userEmail
 * @access Private
 */
export const getBookingsByUser = async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // Basic authorization - user can only see their own bookings
    if (req.user.email !== userEmail) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ userEmail })
      .populate('vehicleId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Get all bookings
 * @route GET /api/bookings
 * @access Private
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch bookings'
    });
  }
};

/**
 * @desc Delete a booking (Simple cancellation)
 * @route DELETE /api/bookings/:id
 * @access Private
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(id).populate('vehicleId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Basic authorization - user can only delete their own bookings
    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    // Make vehicle available again
    if (booking.vehicleId) {
      booking.vehicleId.availability = 'Available';
      await booking.vehicleId.save();
    }

    // Delete the booking
    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ 
      message: 'Failed to delete booking'
    });
  }
};

/**
 * @desc Get single booking by ID
 * @route GET /api/bookings/:id
 * @access Private
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(id).populate('vehicleId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Basic authorization
    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ 
      message: 'Failed to fetch booking'
    });
  }
};

/**
 * @desc Update a booking
 * @route PUT /api/bookings/:id
 * @access Private
 */
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Basic authorization
    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Don't allow changing userEmail or vehicleId for security
    if (updateData.userEmail || updateData.vehicleId) {
      return res.status(400).json({ message: 'Cannot change user or vehicle' });
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('vehicleId');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ 
      message: 'Failed to update booking'
    });
  }
};