const { generateMealPlan, getMealPlan } = require('../services/mealPlanService');

exports.getSaved = async (req, res) => {
  try {
    const mealPlan = await getMealPlan(req.user.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'No saved meal plan found for the current week'
      });
    }

    return res.status(200).json(mealPlan);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.generate = async (req, res) => {
  try {
    const {
      dietType,
      dailyCalories,
      mealsPerDay,
      cuisine,
      maxCookingTime
    } = req.body;

    console.log('Meal plan request received:', {
      dietType,
      dailyCalories,
      mealsPerDay,
      cuisine,
      maxCookingTime
    });

    const calories = Number(dailyCalories);
    const meals = Number(mealsPerDay);
    const cookingTime = maxCookingTime === undefined ? undefined : Number(maxCookingTime);

    if (
      !Number.isFinite(calories) || calories <= 0 ||
      !Number.isInteger(meals) || meals < 1 || meals > 4 ||
      (cookingTime !== undefined && (!Number.isFinite(cookingTime) || cookingTime < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: 'dailyCalories must be positive, mealsPerDay must be between 1 and 4, and maxCookingTime must be non-negative'
      });
    }

    const mealPlan = await generateMealPlan({
      userId: req.user.id,
      dietType,
      dailyCalories: calories,
      mealsPerDay: meals,
      cuisine,
      maxCookingTime: cookingTime
    });

    return res.status(200).json(mealPlan);
  } catch (error) {
    if (
      error.message.startsWith('No ') ||
      error.message.startsWith('Not enough unique ')
    ) {
      return res.status(422).json({
        success: false,
        message: error.message
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
