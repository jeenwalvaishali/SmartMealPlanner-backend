const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

module.exports = app;
