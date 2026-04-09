const express = require('express');
const router = express.Router();

const {
  createRecipe,
  rateRecipe,
  searchRecipes,
  getAllRecipes,
  getRecipeById,
  updateRecipeById,
  deleteRecipeById,
} = require('../controllers/recipeController');

const verifyToken = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');


// ---------- PUBLIC ROUTES ----------

// Get all recipes
router.get('/', getAllRecipes);

// Search recipes
router.get('/search', searchRecipes);

// Get recipe by ID
router.get('/:id', getRecipeById);


// ---------- PROTECTED ROUTES ----------

// Create recipe (ADMIN only)
router.post(
  '/',
  verifyToken,
  roleMiddleware('ADMIN'),
  createRecipe
);

// Update recipe
router.put(
  '/:id',
  verifyToken,
  updateRecipeById
);

// Delete recipe (ADMIN only)
router.delete(
  '/:id',
  verifyToken,
  roleMiddleware('ADMIN'),
  deleteRecipeById
);

// Rate recipe
router.post(
  '/:id/rate',
  verifyToken,
  rateRecipe
);

// Upload recipe image
router.post(
  '/upload',
  verifyToken,
  upload.single('image'),
  (req, res) => {
    res.status(200).json({
      imageUrl: req.file.path,
      imagePublicId: req.file.filename
    });
  }
);

module.exports = router;

