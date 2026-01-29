const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);


module.exports = app;
