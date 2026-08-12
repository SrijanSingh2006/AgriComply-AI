const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Auto-initialize database on startup (safe to run multiple times)
require('./setup-db-init');

const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const trackARoutes = require('./routes/trackARoutes');
const trackBRoutes = require('./routes/trackBRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // 2. Allow specific local development ports
    const allowedLocal = ['http://localhost:5173', 'http://localhost:3000'];
    
    // 3. Allow any sub-domain of vercel.app or onrender.com
    const isVercel = origin.endsWith('.vercel.app');
    const isRender = origin.endsWith('.onrender.com');

    if (allowedLocal.includes(origin) || isVercel || isRender) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: This origin is not allowed.'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/track-a', trackARoutes);
app.use('/api/track-b', trackBRoutes);
// Route aliases for frontend compatibility
app.use('/api/compliance', trackARoutes);
app.use('/api/growth', trackBRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', database: 'SQLite' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AgriComply Server running on http://localhost:${PORT}`);
});