const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
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

// ML Proxy — forwards all /api/ml/* requests to the Python ML service
// This way the frontend never needs to know the tunnel URL
app.all('/api/ml/*', async (req, res) => {
  const ML_URL = process.env.ML_URL || 'http://localhost:5001';
  const targetPath = req.path.replace('/api/ml', '');
  const targetUrl = `${ML_URL}${targetPath}`;

  try {
    const lib = targetUrl.startsWith('https') ? https : http;
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
      },
    };

    const proxyReq = lib.request(targetUrl, options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('ML Proxy error:', err.message);
      res.status(502).json({ error: 'ML service unavailable', detail: err.message });
    });

    if (req.method !== 'GET' && req.body) {
      proxyReq.write(JSON.stringify(req.body));
    }
    proxyReq.end();
  } catch (err) {
    console.error('ML Proxy exception:', err.message);
    res.status(500).json({ error: 'Proxy failed', detail: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AgriComply Server running on http://localhost:${PORT}`);
});