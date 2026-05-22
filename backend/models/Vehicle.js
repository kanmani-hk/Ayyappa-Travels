import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a vehicle name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify vehicle type'],
      enum: ['car', 'tempo', 'suv', 'van'],
    },
    seats: {
      type: Number,
      required: [true, 'Please specify seating capacity'],
    },
    ratePerKm: {
      type: Number,
      required: [true, 'Please specify rate per km in INR'],
    },
    features: {
      type: [String],
      default: ['AC', 'Professional Driver'],
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
