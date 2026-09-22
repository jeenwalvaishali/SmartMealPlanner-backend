const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { generate, getSaved } = require('../controllers/mealPlanController');
const { replaceMeal } = require('../controllers/mealReplacementController');

const router = express.Router();

router.post('/generate', authMiddleware, generate);
router.post('/:mealPlanId/replace', authMiddleware, replaceMeal);
router.get('/', authMiddleware, getSaved);

module.exports = router;
