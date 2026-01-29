const express = require('express');
const router = express.Router();

const {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipeById,
  deleteRecipeById,
} = require('../controllers/recipeController');

const verifyToken = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);

// Protected routes
router.post(
  '/',
  verifyToken,
  roleMiddleware('ADMIN'),
  createRecipe
);

router.put(
  '/:id',
  verifyToken,
  updateRecipeById // ownership + admin handled inside controller
);

router.delete(
  '/:id',
  verifyToken,
  roleMiddleware('ADMIN'),
  deleteRecipeById
);

module.exports = router;
