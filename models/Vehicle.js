import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Electric', 'Van']
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  availability: {
    type: String,
    required: true,
    enum: ['Available', 'Booked'],
    default: 'Available'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  coverImage: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  categories: {
    type: String,
    required: true,
    enum: ['Electric', 'Gasoline', 'Diesel', 'Hybrid']
  }
}, {
  timestamps: true
});

vehicleSchema.index({ userEmail: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ location: 1 });

export default mongoose.model('Vehicle', vehicleSchema);