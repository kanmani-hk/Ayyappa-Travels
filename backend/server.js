import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import bookingRoutes from './routes/bookings.js';
import enquiryRoutes from './routes/enquiries.js';

const app = express();

// Middleware
app.use(express.json());

// CORS configuration - support all origins in development, specify in production
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Ayyappa Travels Backend is running successfully',
    timestamp: new Date().toISOString()
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 10000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n✓ Ayyappa Travels Backend Server running on port ${PORT}`);
    console.log(`✓ API Endpoint Base: http://localhost:${PORT}/api`);
  });
};

startServer();
