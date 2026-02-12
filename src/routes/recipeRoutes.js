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

router.post('/recipes/:id/rate', verifyToken, rateRecipe);

router.get('/recipes/search', searchRecipes);

router.post(
  '/recipes/upload',
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
