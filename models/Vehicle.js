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
  // Consolidated category field based on requirements
  category: {
    type: String,
    required: true,
    // Using the categories specified in the requirement document
    enum: ['Sedan', 'SUV', 'Electric', 'Van'], //
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
    enum: ['Available', 'Booked'], //
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
  // REMOVED: Redundant 'categories' field as it duplicates 'category'
}, {
  timestamps: true
});

vehicleSchema.index({ userEmail: 1 });
vehicleSchema.index({ category: 1 });

export default mongoose.model('Vehicle', vehicleSchema);