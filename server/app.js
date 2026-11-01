const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const { uploadsDir, isVercel } = require('./config/storage');
require('dotenv').config();
const db = require('./config/db');

// Auto-initialize database on startup (safe to run multiple times)
require('./setup-db-init');

const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');
const trackARoutes = require('./routes/trackARoutes');
const trackBRoutes = require('./routes/trackBRoutes');
const authenticate = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // 2. Allow specific local development ports
    const allowedLocal = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];
    
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/track-a', trackARoutes);
app.use('/api/track-b', trackBRoutes);
// Route aliases for frontend compatibility
app.use('/api/compliance', trackARoutes);
app.use('/api/growth', trackBRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.waitReady();
    const database = db.isPostgres ? 'PostgreSQL' : (isVercel ? 'SQLite (temporary)' : 'SQLite');
    res.json({ status: 'Server is running', database });
  } catch (err) {
    res.status(503).json({ status: 'Database unavailable' });
  }
});

// ML Proxy — forwards all /api/ml/* requests to the Python ML service
// This way the frontend never needs to know the tunnel URL
app.all('/api/ml/*', authenticate, async (req, res) => {
  const ML_URL = (process.env.ML_URL || 'http://localhost:5001').replace(/\/$/, '');
  const targetPath = req.originalUrl.slice('/api/ml'.length);
  const targetUrl = `${ML_URL}${targetPath}`;

  try {
    const lib = targetUrl.startsWith('https') ? https : http;
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        ...(req.headers.accept ? { Accept: req.headers.accept } : {}),
      },
    };

    const proxyReq = lib.request(targetUrl, options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      ['content-type', 'content-disposition', 'cache-control'].forEach((key) => {
        if (proxyRes.headers[key]) res.setHeader(key, proxyRes.headers[key]);
      });
      proxyRes.pipe(res);
    });

    proxyReq.setTimeout(120000, () => proxyReq.destroy(new Error('ML service request timed out')));
    proxyReq.on('error', (err) => {
      console.error('ML Proxy error:', err.message);
      if (!res.headersSent) res.status(502).json({ error: 'ML service unavailable. Please retry in a moment.' });
    });

    if (req.method === 'GET' || req.method === 'HEAD') {
      proxyReq.end();
    } else if (req.is('application/json') || req.is('application/x-www-form-urlencoded')) {
      proxyReq.write(JSON.stringify(req.body));
      proxyReq.end();
    } else {
      req.pipe(proxyReq);
    }
  } catch (err) {
    console.error('ML Proxy exception:', err.message);
    if (!res.headersSent) res.status(500).json({ error: 'Could not reach the ML service.' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AgriComply Server running on http://localhost:${PORT}`);
});
