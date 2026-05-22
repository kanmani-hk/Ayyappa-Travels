import express from 'express';
import Joi from 'joi';
import Vehicle from '../models/Vehicle.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Joi schema for validating vehicle inputs
const vehicleSchemaJoi = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Vehicle name is required',
  }),
  type: Joi.string().valid('car', 'tempo').required().messages({
    'any.only': 'Type must be either car or tempo',
  }),
  seats: Joi.number().integer().min(4).max(17).required().messages({
    'number.base': 'Seats must be a number',
    'number.min': 'Minimum seats capacity is 4',
    'number.max': 'Maximum seats capacity is 17',
  }),
  ratePerKm: Joi.number().min(1).required().messages({
    'number.min': 'Rate per km must be greater than 0',
  }),
  features: Joi.array().items(Joi.string()).default([]),
  image: Joi.string().uri().required().messages({
    'string.uri': 'Please provide a valid image URL',
    'string.empty': 'Vehicle image is required',
  }),
  isAvailable: Joi.boolean().default(true),
  description: Joi.string().allow('', null),
});

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    console.error('Get Vehicles Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving vehicles' });
  }
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Get Single Vehicle Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving vehicle' });
  }
});

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
  // Validate request body
  const { error, value } = vehicleSchemaJoi.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const newVehicle = await Vehicle.create(value);
    res.status(201).json({ success: true, data: newVehicle });
  } catch (error) {
    console.error('Create Vehicle Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating vehicle' });
  }
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  // Validate request body
  const { error, value } = vehicleSchemaJoi.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Update Vehicle Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating vehicle' });
  }
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete Vehicle Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting vehicle' });
  }
});

export default router;
