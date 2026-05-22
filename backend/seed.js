import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Booking from './models/Booking.js';

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});

    console.log('Creating Admin account...');
    const adminUser = await User.create({
      name: 'Ayyappa Admin',
      email: 'admin@ayyappatravels.com',
      password: 'ayyappa_travels_admin_2026', // Schema pre-save hooks will hash this!
      role: 'admin',
    });
    console.log(`✓ Admin User created: ${adminUser.email}`);

    console.log('Creating Vehicles fleet (4 Cars)...');
    const vehicles = [
      {
        name: 'Suzuki Swift Dzire (5 Seats)',
        type: 'car',
        seats: 5,
        ratePerKm: 12,
        features: ['A/C Cabin', 'Ayyappa Windshield Sticker', 'Comfortable Seating', 'Perfect for Small Family Trips'],
        image: '/car1_new.jpg',
        description: 'Featuring our highly reliable family sedans (TN 84 R 3542) with powerful air conditioning and optional robust luggage carriers. Spotless cabins decorated with devotion, ideal for small families.'
      },
      {
        name: 'Chevrolet Tavera Neo - Spacious Multi-Utility SUV',
        type: 'car',
        seats: 10,
        ratePerKm: 14,
        features: ['High-Power Dual A/C', 'Spacious Top Luggage Carrier', '10 Seating Capacity', 'Perfect for Big Families & Group Tours'],
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop',
        description: 'Extremely spacious 10-seater White Tavera with comfortable cushioning, top carrier, and superior suspension.'
      },
      {
        name: 'Tata Ace / Mahindra Supro',
        type: 'suv',
        seats: 8,
        ratePerKm: 13,
        features: ['Clean Cabin Space', 'Tamil Text "வேல்" Trim', 'Ayyampatti Sacred Trip Specialist', '8 Seating Capacity'],
        image: '/car4_new.jpg',
        description: 'Dedicated pilgrimage van decorated with sacred trims, perfect for local temple circuits, small group runs and cargo hauling with secure top cover.'
      }
    ];

    await Vehicle.create(vehicles);
    console.log('✓ Vehicle fleet populated successfully!');

    // Create a sample booking to populate dashboard initially
    const sampleVehicle = await Vehicle.findOne({ seats: 10 });
    if (sampleVehicle) {
      await Booking.create({
        customerName: 'Karthik Raja',
        customerEmail: 'karthik@example.com',
        customerPhone: '+91-9150549150',
        pickupLocation: 'Srivilliputtur Temple, Srivilliputtur',
        dropLocation: 'Madurai Meenakshi Temple, Madurai',
        pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        groupSize: 8,
        vehicle: sampleVehicle._id,
        estimatedDistance: 150,
        estimatedCost: 150 * sampleVehicle.ratePerKm + 300 + 1 * 300,
        status: 'pending',
        specialInstructions: 'Need traditional decorations for a marriage pilgrimage yatra.',
      });
      console.log('✓ Sample booking seeded successfully!');
    }

    console.log('\n✓ Database Seeding Completed Successfully! All ready for development.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
