import { Booking, Vehicle } from '../models/index.js';

export const createBooking = async (req, res) => {
  try {
    const { vehicleId, userEmail, startDate, endDate, notes } = req.body;
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    if (vehicle.availability === 'Booked') {
      return res.status(400).json({ message: 'Vehicle is already booked' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * vehicle.pricePerDay;
    
    const booking = new Booking({
      vehicleId,
      userEmail,
      startDate: start,
      endDate: end,
      totalPrice,
      notes
    });
    
    await booking.save();
    
    vehicle.availability = 'Booked';
    await vehicle.save();
    
    const populatedBooking = await Booking.findById(booking._id).populate('vehicleId');
    
    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBookingsByUser = async (req, res) => {
  try {
    const { userEmail } = req.params;
    
    const bookings = await Booking.find({ userEmail })
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicleId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    
    booking.vehicleId.availability = 'Available';
    await booking.vehicleId.save();
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};