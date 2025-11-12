import { Booking, Vehicle } from '../models/index.js';


export const createBooking = async (req, res) => {
  try {
    const { vehicleId, userEmail, startDate, endDate, notes } = req.body;

    if (!vehicleId || !userEmail || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.availability !== 'Available') {
      return res.status(400).json({ message: 'Vehicle is not available' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * vehicle.pricePerDay;

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

    vehicle.availability = 'Booked';
    await vehicle.save();

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


export const getBookingsByUser = async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

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

    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

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

    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (updateData.userEmail || updateData.vehicleId) {
      return res.status(400).json({ message: 'Cannot change user or vehicle' });
    }

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