const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { generate, getSaved } = require('../controllers/mealPlanController');

const router = express.Router();

router.post('/generate', authMiddleware, generate);
router.get('/', authMiddleware, getSaved);

module.exports = router;
