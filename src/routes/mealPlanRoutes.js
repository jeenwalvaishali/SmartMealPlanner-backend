const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { generate } = require('../controllers/mealPlanController');

const router = express.Router();

router.post('/generate', authMiddleware, generate);

module.exports = router;
