import express from 'express';
import Joi from 'joi';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper: Format date as dd/mm/yyyy hh:mm AM/PM
const formatDateStr = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return String(dateString);
  const pad = (n) => (n < 10 ? '0' + n : n);
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(hours)}:${pad(d.getMinutes())} ${ampm}`;
};

// Helper to check for valid Mongo Object ID
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Booking Joi Validation Schema
const bookingSchemaJoi = Joi.object({
  customerName: Joi.string().trim().required().messages({
    'string.empty': 'Your name is required',
  }),
  customerEmail: Joi.string().email().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Your email is required',
  }),
  customerPhone: Joi.string().trim().required().messages({
    'string.empty': 'Your contact phone number is required',
  }),
  pickupLocation: Joi.string().trim().required().messages({
    'string.empty': 'Pickup location is required',
  }),
  dropLocation: Joi.string().trim().required().messages({
    'string.empty': 'Drop location is required',
  }),
  pickupDate: Joi.date().required().messages({
    'date.base': 'Please provide a valid pickup date and time',
  }),
  returnDate: Joi.date().greater(Joi.ref('pickupDate')).required().messages({
    'date.base': 'Please provide a valid return date',
    'date.greater': 'Return date must be after pickup date',
  }),
  groupSize: Joi.number().integer().min(1).required().messages({
    'number.min': 'Number of travelers must be at least 1',
  }),
  vehicle: Joi.string().custom(objectIdValidator).required().messages({
    'any.invalid': 'Please select a valid vehicle',
    'any.required': 'Vehicle selection is required',
  }),
  estimatedDistance: Joi.number().min(1).required().messages({
    'number.min': 'Estimated distance must be at least 1 km',
  }),
  specialInstructions: Joi.string().allow('', null),
});

// Helper: Calculate Quote breakdown
const calculateBreakdown = (ratePerKm, distance, daysCount) => {
  const baseCost = ratePerKm * distance;
  
  // Calculate tolls based on distance
  let tollCharges = 0;
  if (distance > 100) tollCharges = 300;
  if (distance > 200) tollCharges = 600;
  if (distance > 400) tollCharges = 1200;

  // Driver allowance / night charges (₹300 per day)
  const driverAllowance = daysCount * 300;

  const total = baseCost + tollCharges + driverAllowance;

  return {
    baseCost,
    tollCharges,
    driverAllowance,
    total,
  };
};

// Helper: Get days count between two dates
const getDaysCount = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1; // Default to 1 day if trip is same day
};

// Helper: Send Fail-Safe NodeMailer Email
const sendConfirmationEmail = async (booking, vehicle, breakdown) => {
  try {
    // Standard Mailer Config. It will look for Env variables or fallback safely
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'demo@ethereal.email',
        pass: process.env.SMTP_PASS || 'demo_pass',
      },
    });

    const pickupFormatted = formatDateStr(booking.pickupDate);
    const returnFormatted = formatDateStr(booking.returnDate);
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #f97316; padding: 25px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Ayyappa Travels</h1>
          <p style="margin: 5px 0 0; font-size: 14px;">Booking Quote Request Received</p>
        </div>
        <div style="padding: 25px; color: #333333; line-height: 1.6;">
          <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 5px; margin-top: 0;">Hi ${booking.customerName},</h2>
          <p>Thank you for choosing <strong>Ayyappa Travels</strong>, Srivilliputtur's premium private outstation & pilgrimage car service.</p>
          <p>We have successfully received your quote request. Below is a detailed summary of your estimated itinerary:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #fdf2e9;"><td style="padding: 10px; border: 1px solid #eeeeee; font-weight: bold;">Vehicle</td><td style="padding: 10px; border: 1px solid #eeeeee;">${vehicle.name} (${vehicle.seats}-Seater Capacity)</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eeeeee; font-weight: bold;">Route</td><td style="padding: 10px; border: 1px solid #eeeeee;">${booking.pickupLocation} to ${booking.dropLocation}</td></tr>
            <tr style="background-color: #fdf2e9;"><td style="padding: 10px; border: 1px solid #eeeeee; font-weight: bold;">Pickup</td><td style="padding: 10px; border: 1px solid #eeeeee;">${pickupFormatted}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eeeeee; font-weight: bold;">Return</td><td style="padding: 10px; border: 1px solid #eeeeee;">${returnFormatted}</td></tr>
            <tr style="background-color: #fdf2e9;"><td style="padding: 10px; border: 1px solid #eeeeee; font-weight: bold;">Estimated Distance</td><td style="padding: 10px; border: 1px solid #eeeeee;">${booking.estimatedDistance} km</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eeeeee; font-weight: bold;">Group Size</td><td style="padding: 10px; border: 1px solid #eeeeee;">${booking.groupSize} Persons</td></tr>
          </table>

          <h3 style="color: #33; margin-top: 25px;">Estimated Quote Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; color: #666;">Base Rate (₹${vehicle.ratePerKm}/km × ${booking.estimatedDistance} km)</td><td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 500;">₹${breakdown.baseCost}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; color: #666;">Estimated Tolls / Permits</td><td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 500;">₹${breakdown.tollCharges}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; color: #666;">Driver Allowance (${getDaysCount(booking.pickupDate, booking.returnDate)} Days × ₹300/day)</td><td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 500;">₹${breakdown.driverAllowance}</td></tr>
            <tr style="font-size: 18px; font-weight: bold;"><td style="padding: 15px 0 0; color: #111;">Estimated Cost (Total)</td><td style="padding: 15px 0 0; text-align: right; color: #f97316;">₹${breakdown.total}</td></tr>
          </table>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 25px; font-size: 13px; color: #555555; border-left: 4px solid #f97316;">
            <strong>Please Note:</strong> This is an estimated quote. Tolls and state permits are calculated based on general routes. Our booking representative will contact you at <strong>${booking.customerPhone}</strong> to confirm scheduling and final rates.
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://wa.me/919150549150?text=Hi%20Ayyappa%20Travels,%20I%20have%20submitted%20a%20booking%20request%20for%20a%20${vehicle.seats}-seater%20vehicle." style="background-color: #25d366; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              💬 Confirm via WhatsApp
            </a>
          </div>
        </div>
        <div style="background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0 0 5px;"><strong>Ayyappa Travels Srivilliputtur</strong></p>
          <p style="margin: 0 0 5px;">54 D, Ayyampatti Sekkadi Street, Near PRC Tippo, Ayyampatti, Srivilliputtur-626125, Tamil Nadu</p>
          <p style="margin: 0;">Call/WhatsApp: +91-9150549150</p>
        </div>
      </div>
    `;

    // Try sending email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Ayyappa Travels" <no-reply@ayyappatravels.com>',
      to: booking.customerEmail,
      subject: `Your Booking Quote (₹${breakdown.total}) - Ayyappa Travels`,
      html: emailHtml,
    });

    console.log(`✓ Nodemailer Email Sent: ${info.messageId}`);
  } catch (emailErr) {
    console.error('❌ Confirmation Email Error:');
    console.error('  Message :', emailErr.message);
    console.error('  Code    :', emailErr.code);
    console.error('  Response:', emailErr.response || 'N/A');
    console.warn('⚠ Booking was saved to DB, but confirmation email failed to send.');
  }
};

// Helper: Send Status Update Email
const sendStatusUpdateEmail = async (booking, status) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'demo@ethereal.email',
        pass: process.env.SMTP_PASS || 'demo_pass',
      },
    });

    const pickupFormatted = formatDateStr(booking.pickupDate);
    let statusText = '';
    let statusColor = '';
    
    if (status === 'confirmed') {
      statusText = 'Booking Confirmed ✅';
      statusColor = '#16a34a'; // Green
    } else if (status === 'cancelled') {
      statusText = 'Booking Cancelled ❌';
      statusColor = '#dc2626'; // Red
    } else {
      return; // Only send emails for confirmed or cancelled
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: ${statusColor}; padding: 25px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Ayyappa Travels</h1>
          <p style="margin: 5px 0 0; font-size: 14px;">${statusText}</p>
        </div>
        <div style="padding: 25px; color: #333333; line-height: 1.6;">
          <h2 style="color: ${statusColor}; border-bottom: 2px solid ${statusColor}; padding-bottom: 5px; margin-top: 0;">Hi ${booking.customerName},</h2>
          <p>Your booking request for <strong>${booking.vehicle ? booking.vehicle.name : 'a vehicle'}</strong> from <strong>${booking.pickupLocation}</strong> to <strong>${booking.dropLocation}</strong> on <strong>${pickupFormatted}</strong> has been <strong>${status}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 25px; font-size: 13px; color: #555555; border-left: 4px solid ${statusColor};">
            <strong>Contact Us:</strong> If you have any questions or need further assistance, please contact our support at +91-9150549150.
          </div>
        </div>
        <div style="background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0 0 5px;"><strong>Ayyappa Travels Srivilliputtur</strong></p>
          <p style="margin: 0 0 5px;">54 D, Ayyampatti Sekkadi Street, Near PRC Tippo, Ayyampatti, Srivilliputtur-626125, Tamil Nadu</p>
          <p style="margin: 0;">Call/WhatsApp: +91-9150549150</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Ayyappa Travels" <no-reply@ayyappatravels.com>',
      to: booking.customerEmail,
      subject: `Your Booking is ${status.charAt(0).toUpperCase() + status.slice(1)} - Ayyappa Travels`,
      html: emailHtml,
    });

    console.log(`✓ Nodemailer Status Email Sent: ${info.messageId}`);
  } catch (emailErr) {
    console.error('❌ Status Email Error:');
    console.error('  Message :', emailErr.message);
    console.error('  Code    :', emailErr.code);
    console.error('  Response:', emailErr.response || 'N/A');
  }
};

// @desc    Calculate quote without creating booking
// @route   POST /api/bookings/calculate-quote
// @access  Public
router.post('/calculate-quote', async (req, res) => {
  const { vehicleId, estimatedDistance, pickupDate, returnDate } = req.body;

  if (!vehicleId || !estimatedDistance || !pickupDate || !returnDate) {
    return res.status(400).json({ success: false, message: 'Missing parameters for quote calculation' });
  }

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const daysCount = getDaysCount(pickupDate, returnDate);
    const breakdown = calculateBreakdown(vehicle.ratePerKm, Number(estimatedDistance), daysCount);

    res.json({
      success: true,
      data: {
        vehicle: vehicle.name,
        seats: vehicle.seats,
        ratePerKm: vehicle.ratePerKm,
        estimatedDistance: Number(estimatedDistance),
        daysCount,
        breakdown,
      },
    });
  } catch (error) {
    console.error('Calculate Quote Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during calculation' });
  }
});

// @desc    Create new booking quote
// @route   POST /api/bookings
// @access  Public
router.post('/', async (req, res) => {
  // Validate req body
  const { error, value } = bookingSchemaJoi.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const vehicle = await Vehicle.findById(value.vehicle);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Selected vehicle not found' });
    }

    // Calculate cost
    const daysCount = getDaysCount(value.pickupDate, value.returnDate);
    const breakdown = calculateBreakdown(vehicle.ratePerKm, value.estimatedDistance, daysCount);

    // Save booking to DB
    const newBooking = await Booking.create({
      ...value,
      estimatedCost: breakdown.total,
    });

    // Send confirmation email (runs asynchronously, doesn't block response)
    sendConfirmationEmail(newBooking, vehicle, breakdown);

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully! We have sent a details email.',
      data: newBooking,
      breakdown,
    });
  } catch (error) {
    console.error('Create Booking Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error submitting booking' });
  }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('vehicle', 'name type seats ratePerKm')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('Get Bookings Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving bookings' });
  }
});

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private/Admin
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle', 'name type seats ratePerKm image');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Get Booking ID Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving booking' });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status' });
  }

  try {
    const booking = await Booking.findById(req.params.id).populate('vehicle');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only send email if status actually changed
    const statusChanged = booking.status !== status;
    
    booking.status = status;
    await booking.save();

    // Send email to customer asynchronously
    if (statusChanged) {
      sendStatusUpdateEmail(booking, status);
    }

    res.json({ success: true, message: `Booking status updated to ${status}`, data: booking });
  } catch (error) {
    console.error('Update Booking Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating booking status' });
  }
});

// @desc    Get analytics / booking statistics
// @route   GET /api/bookings/analytics
// @access  Private/Admin
router.get('/analytics/dashboard', protect, async (req, res) => {
  try {
    // Bookings count grouped by status
    const statusCounts = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Total estimated revenue (from confirmed/completed bookings)
    const revenueData = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$estimatedCost' } } }
    ]);

    // Group bookings by vehicle
    const vehicleData = await Booking.aggregate([
      { $group: { _id: '$vehicle', count: { $sum: 1 } } }
    ]);
    const populatedVehicles = await Vehicle.populate(vehicleData, { path: '_id', select: 'name type seats' });

    // Recent 5 bookings
    const recentBookings = await Booking.find({})
      .populate('vehicle', 'name seats')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalBookings = await Booking.countDocuments();

    res.json({
      success: true,
      data: {
        totalBookings,
        statusBreakdown: statusCounts,
        estimatedRevenue: revenueData[0]?.totalRevenue || 0,
        vehicleBookings: populatedVehicles,
        recentBookings,
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating dashboard analytics' });
  }
});

export default router;
