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
const multer = require('multer');
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
router.post("/upload", verifyToken, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Upload failed: image must be 5MB or smaller.",
            error: err.message,
            code: err.code,
          });
        }

        return res.status(400).json({
          success: false,
          message: "Upload failed: invalid file or size exceeded.",
          error: err.message,
          code: err.code,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Image upload failed.",
        error: err.message,
        code: err.name,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Use the field name `image`.",
      });
    }

    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
    });
  });
});

// router.post('/upload', verifyToken, (req, res, next) => {
//   upload.single('image')(req, res, (err) => {
//     if (err) {
//       const statusCode = err instanceof multer.MulterError ? 400 : 500;
//       return res.status(statusCode).json({
//         success: false,
//         message: 'Image upload failed',
//         error: err.message,
//         code: err.code || err.name
//       });
//     }

//     if (err instanceof multer.MulterError) {
//       return res.status(400).json({
//         success: false,
//         message: 'Upload failed: invalid file or size exceeded',
//         error: err.message,
//         code: err.code
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No image file provided. Use the field name `image`.',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       imageUrl: req.file.path,
//       imagePublicId: req.file.filename
//     });
//   });
// });

module.exports = router;

