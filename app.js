require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedAdmin } = require('./controllers/authController');

const app = express();

// Connect DB then seed admin (only once)
let dbConnected = false;
const ensureDB = async () => {
  if (!dbConnected) {
    await connectDB();
    await seedAdmin();
    dbConnected = true;
  }
};
ensureDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));

// Raw body for Stripe webhooks
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images (local dev only — on Netlify use cloud storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static public files (local dev; Netlify serves /public directly)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/menu',         require('./routes/menuRoutes'));
app.use('/api/orders',       require('./routes/orderRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/events',       require('./routes/eventRoutes'));
app.use('/api/reviews',      require('./routes/reviewRoutes'));
app.use('/api/payments',     require('./routes/paymentRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'The Golden Fork API is running' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
