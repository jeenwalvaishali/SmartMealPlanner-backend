const mongoose = require('mongoose');
const { askAI } = require('../services/aiService');
const {
  filterRecipes,
  getMealPlanById
} = require('../services/mealPlanService');

const MEAL_TYPES = new Set(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']);

const parseSelection = (answer) => {
  const jsonMatch = answer.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    return null;
  }
};

const getSelectedCandidate = (answer, candidates) => {
  const selection = parseSelection(answer);

  if (!selection) {
    return null;
  }

  if (selection.recipeId) {
    const candidateById = candidates.find((recipe) => (
      recipe._id.toString() === String(selection.recipeId)
    ));

    if (candidateById) {
      return candidateById;
    }
  }

  if (selection.title) {
    const normalizedTitle = String(selection.title).trim().toLowerCase();
    return candidates.find((recipe) => (
      recipe.title.trim().toLowerCase() === normalizedTitle
    )) || null;
  }

  return null;
};

exports.replaceMeal = async (req, res) => {
  try {
    const { mealPlanId } = req.params;
    const day = typeof req.body.day === 'string' ? req.body.day.trim() : '';
    const mealType = typeof req.body.mealType === 'string'
      ? req.body.mealType.trim().toUpperCase()
      : '';

    if (!mongoose.Types.ObjectId.isValid(mealPlanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal plan ID'
      });
    }

    if (!day || !MEAL_TYPES.has(mealType)) {
      return res.status(400).json({
        success: false,
        message: 'day and a valid mealType are required'
      });
    }

    const mealPlan = await getMealPlanById(req.user.id, mealPlanId);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found'
      });
    }

    const dayPlan = mealPlan.days.find((item) => (
      item.day.trim().toLowerCase() === day.toLowerCase()
    ));

    if (!dayPlan) {
      return res.status(404).json({
        success: false,
        message: `No meal plan found for ${day}`
      });
    }

    const meal = dayPlan.meals.find((item) => item.mealType === mealType);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: `No ${mealType.toLowerCase()} meal found for ${day}`
      });
    }

    const candidates = (await filterRecipes({
      ...(mealPlan.preferences || {}),
      mealType,
      excludeRecipeId: meal.recipe && meal.recipe._id
    })).slice(0, 20);

    if (candidates.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'No compatible replacement recipes found'
      });
    }

    const candidateContext = candidates.map((recipe) => ({
      recipeId: recipe._id.toString(),
      title: recipe.title,
      calories: recipe.calories,
      prepTime: recipe.prepTime,
      mealTypes: recipe.mealTypes
    }));

    const prompt = [
      'You are the Smart Meal Planner assistant.',
      'Select exactly one replacement recipe from the candidate list.',
      'Return only valid JSON in this format: {"recipeId":"candidate id","title":"candidate title"}.',
      'Never invent a recipe or use an ID that is not in the candidate list.',
      '',
      `Diet: ${mealPlan.preferences?.dietType || 'Not specified'}`,
      `Cuisine: ${mealPlan.preferences?.cuisine || 'Not specified'}`,
      `Daily calories: ${mealPlan.preferences?.dailyCalories || 'Not specified'}`,
      `Maximum cooking time: ${mealPlan.preferences?.maxCookingTime === undefined ? 'Not specified' : `${mealPlan.preferences.maxCookingTime} minutes`}`,
      '',
      `Meal to replace: ${day} ${mealType}`,
      `Current recipe: ${meal.recipe?.title || 'Not specified'}`,
      '',
      'Candidate replacement recipes:',
      JSON.stringify(candidateContext, null, 2)
    ].join('\n');

    const answer = await askAI(prompt, {
      num_predict: 64,
      temperature: 0
    });
    const selectedRecipe = getSelectedCandidate(answer, candidates);

    if (!selectedRecipe) {
      return res.status(502).json({
        success: false,
        message: 'AI returned an invalid recipe selection'
      });
    }

    meal.recipe = selectedRecipe._id;
    dayPlan.totalCalories = dayPlan.meals.reduce((total, dayMeal) => {
      if (dayMeal === meal) {
        return total + selectedRecipe.calories;
      }

      return total + (dayMeal.recipe?.calories || 0);
    }, 0);

    await mealPlan.save();

    return res.status(200).json({
      mealType,
      recipe: {
        id: selectedRecipe._id,
        title: selectedRecipe.title,
        calories: selectedRecipe.calories,
        prepTime: selectedRecipe.prepTime
      }
    });
  } catch (error) {
    console.error('Meal replacement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};