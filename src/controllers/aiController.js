const { askAI } = require('../services/aiService');
const { getMealPlan, filterRecipes } = require('../services/mealPlanService');

const formatPreferences = (preferences = {}) => [
  `Diet: ${preferences.dietType || 'Not specified'}`,
  `Cuisine: ${preferences.cuisine || 'Not specified'}`,
  `Daily calories: ${preferences.dailyCalories || 'Not specified'}`,
  `Meals per day: ${preferences.mealsPerDay || 'Not specified'}`,
  `Maximum cooking time: ${preferences.maxCookingTime === undefined ? 'Not specified' : `${preferences.maxCookingTime} minutes`}`
].join('\n');

const formatCurrentMealPlan = (mealPlan) => mealPlan.days
  .map((day) => {
    const meals = day.meals.map((meal) => {
      const recipe = meal.recipe;

      if (!recipe) {
        return `- ${meal.mealType}: No recipe details available`;
      }

      return [
        `- ${meal.mealType}: ${recipe.title}`,
        `  Calories: ${recipe.calories}`,
        `  Cooking time: ${recipe.prepTime === undefined ? 'Not specified' : `${recipe.prepTime} minutes`}`
      ].join('\n');
    }).join('\n');

    return `${day.day} (${day.totalCalories} calories)\n${meals}`;
  })
  .join('\n');

const formatAvailableRecipes = (recipes) => recipes.length === 0
  ? 'No compatible replacement recipes found.'
  : recipes.map((recipe, index) => [
    `${index + 1}. ${recipe.title}`,
    `   Calories: ${recipe.calories}`,
    `   Cooking time: ${recipe.prepTime} minutes`,
    `   Meal types: ${(recipe.mealTypes || []).join(', ') || 'Not specified'}`
  ].join('\n')).join('\n');

exports.chat = async (req, res) => {
  try {
    const message = typeof req.body.message === 'string'
      ? req.body.message.trim()
      : '';

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'message is required'
      });
    }

    const mealPlan = await getMealPlan(req.user.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'No saved meal plan found for the current week'
      });
    }

    const availableRecipes = (await filterRecipes(mealPlan.preferences || {})).slice(0, 20);
    const prompt = [
      'You are the Smart Meal Planner assistant.',
      'Use only the controlled application context below when answering.',
      'Recommend replacements only from the available replacement recipes.',
      'If the information is insufficient, say so clearly. Do not invent recipe details.',
      '',
      'User preferences:',
      formatPreferences(mealPlan.preferences),
      '',
      'Current meal plan:',
      formatCurrentMealPlan(mealPlan),
      '',
      'Available replacement recipes:',
      formatAvailableRecipes(availableRecipes),
      '',
      `User request: "${message}"`
    ].join('\n');

    const answer = await askAI(prompt, {
      num_predict: 256,
      temperature: 0.2
    });

    return res.status(200).json({
      success: true,
      answer
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(502).json({
      success: false,
      message: 'AI service is unavailable'
    });
  }
};