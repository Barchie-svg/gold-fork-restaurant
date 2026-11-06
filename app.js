require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedAdmin } = require('./controllers/authController');

const app = express();

// ── Database connection (singleton — safe for serverless cold starts) ──────
let dbReady = false;
let dbPromise = null;

const ensureDB = () => {
  if (dbReady) return Promise.resolve();
  if (dbPromise) return dbPromise;          // already connecting — reuse promise
  dbPromise = connectDB()
    .then(() => seedAdmin())
    .then(() => { dbReady = true; })
    .catch(err => {
      // Reset so the next invocation retries
      dbPromise = null;
      throw err;
    });
  return dbPromise;
};

// Expose so the Netlify function handler can await it before serving requests
app.ensureDB = ensureDB;

// Kick off DB connection immediately (best-effort on module load)
ensureDB().catch(() => {});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));

// Raw body needed for Stripe webhook signature verification
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (local dev — Netlify serves /public directly from CDN)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/menu',         require('./routes/menuRoutes'));
app.use('/api/orders',       require('./routes/orderRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/events',       require('./routes/eventRoutes'));
app.use('/api/reviews',      require('./routes/reviewRoutes'));
app.use('/api/payments',     require('./routes/paymentRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'The Golden Fork API is running', db: dbReady });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
