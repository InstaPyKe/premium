const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const appRoutes = require('./routes/appRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const authRoutes = require('./routes/authRoutes');
const referralRoutes = require('./routes/referralRoutes');
const settingRoutes = require('./routes/settingRoutes');
const visitorRoutes = require('./routes/visitorRoutes');

const { errorHandler } = require('./middleware/errorHandler');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const ROOT_DIR = path.resolve(__dirname, '..');

// Enable Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: '*', // Allow requests from any frontend origin during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (index.html, store.js, admin/, etc.)
app.use(express.static(ROOT_DIR));

// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Explicit root route serving index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Register API Routes under /api
app.use('/api/health', healthRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/visitors', visitorRoutes);

// API 404 handler (only for unmatched /api routes)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found - ${req.originalUrl}`
  });
});

// Fallback for HTML page navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Global error handling middleware
app.use(errorHandler);

// Start server and test database connection
const startServer = async () => {
  try {
    // Test PostgreSQL database connection
    await db.testConnection();

    // Start listening for incoming HTTP requests
    app.listen(PORT, () => {
      console.log(`🚀 PremiumStore website is LIVE on: http://localhost:${PORT}`);
      console.log(`🏠 Homepage URL     : http://localhost:${PORT}/index.html`);
      console.log(`🛡️ Admin Console URL : http://localhost:${PORT}/admin/admin.html`);
      console.log(`📡 API Base URL     : http://localhost:${PORT}/api`);
      console.log('--------------------------------------------------');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
