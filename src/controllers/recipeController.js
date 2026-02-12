const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');


exports.createRecipe = async (req, res) => {
    try {
        // 1. Admin authorization check
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // 2. Extract allowed fields only
        const {
            title,
            description,
            ingredients,
            steps,
            cuisine,
            prepTime,
            imageUrl,
            imagePublicId
        } = req.body;

        // 3. Validation
        if (
            !title ||
            !description ||
            !Array.isArray(ingredients) || ingredients.length === 0 ||
            !Array.isArray(steps) || steps.length === 0 ||
            !cuisine ||
            !prepTime ||
            !imageUrl ||
            !imagePublicId
        ) {
            return res.status(400).json({ message: 'Invalid or missing fields' });
        }

        // 4. Create recipe
        const recipe = await Recipe.create({
            title,
            description,
            ingredients,
            steps,
            cuisine,
            prepTime,
            imageUrl,
            imagePublicId,
            createdBy: req.user.id
        });

        // 5. Response
        res.status(201).json({
            message: 'Recipe created successfully',
            recipe
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getAllRecipes = async (req, res) => {
    try {
        // 1. Pagination (safe defaults + limits)
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        // 2. Filters
        const filter = {};

        if (req.query.cuisine) {
            filter.cuisine = {
                $regex: req.query.cuisine,
                $options: 'i', // case-insensitive
            };
        }

        // 3. Query
        const recipes = await Recipe.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalRecipes = await Recipe.countDocuments(filter);

        // 4. Response
        res.status(200).json({
            success: true,
            count: recipes.length,
            total: totalRecipes,
            page,
            pages: Math.ceil(totalRecipes / limit),
            data: recipes,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

exports.getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipe ID',
            });
        }

        // 2. Fetch recipe
        const recipe = await Recipe.findById(id)
            .populate('createdBy', 'name email')
            .lean();

        // 3. Recipe Not found
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found',
            });
        }

        // 4. Success response
        res.status(200).json({
            success: true,
            data: recipe,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};


exports.updateRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // 1. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipe ID',
            });
        }

        // 2. Find recipe
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found',
            });
        }

        // 3. Authorization check
        const isOwner = recipe.createdBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You are not allowed to update this recipe',
            });
        }

        // 4. Update recipe
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).lean();

        // 5. Success
        res.status(200).json({
            success: true,
            data: updatedRecipe,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

exports.deleteRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipe ID',
            });
        }

        // 2. Find recipe
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found',
            });
        }

        // 3. Authorization (ADMIN only)
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access required',
            });
        }

        //  Delete image from Cloudinary
        if (recipe.imagePublicId) {
            await cloudinary.uploader.destroy(recipe.imagePublicId);
        }

        // 4. Delete recipe
        await Recipe.findByIdAndDelete(id);

        // 5. Success (No Content)
        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

exports.rateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const userId = req.user.id;

        // 1. Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipe ID',
            });
        }

        // 2. Validate rating value
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        // 3. Fetch recipe
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found',
            });
        }

        // 4. Check if user already rated
        const existingRating = recipe.ratings.find(
            r => r.user.toString() === userId
        );

        if (existingRating) {
            // Update rating
            existingRating.value = rating;
        } else {
            // Add new rating
            recipe.ratings.push({
                user: userId,
                value: rating,
            });
        }

        // 5. Recalculate average rating
        recipe.calculateAvgRating();

        await recipe.save();

        // 6. Success response
        res.status(200).json({
            success: true,
            avgRating: recipe.avgRating,
            totalRatings: recipe.ratings.length,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

exports.searchRecipes = async (req, res) => {
    try {
        const {
            keyword,
            cuisine,
            ingredient,
            minRating,
            sort,
            page,
            limit
        } = req.query;

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.min(parseInt(limit) || 10, 50);
        const skip = (pageNumber - 1) * limitNumber;

        const query = {};

        // 🔎 Text search
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        // 🍝 Cuisine filter
        if (cuisine) {
            query.cuisine = { $regex: cuisine, $options: 'i' };
        }

        // 🥕 Ingredient filter
        if (ingredient) {
            query.ingredients = {
                $elemMatch: { $regex: ingredient, $options: 'i' }
            };
        }

        // ⭐ Rating filter
        if (minRating) {
            query.avgRating = { $gte: Number(minRating) };
        }

        const sortMap = {
            rating: { avgRating: -1 },
            prepTime: { prepTime: 1 },
            newest: { createdAt: -1 }
        };

        const sortOption = sortMap[sort] || { createdAt: -1 };

        const recipes = await Recipe.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber)
            .lean();

        const total = await Recipe.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            pages: Math.ceil(total / limitNumber),
            data: recipes
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};





