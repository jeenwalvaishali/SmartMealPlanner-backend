const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err && err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'Upload failed due to invalid file or upload configuration.',
      error: err.message,
      code: err.code
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    error: err.stack ? err.stack.split('\n')[0] : undefined,
  });
});

module.exports = app;
