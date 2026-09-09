const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

const DAY_NAMES = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCalorieDistribution = (dailyCalories, mealsPerDay) => {
  if (mealsPerDay === 1) {
    return { BREAKFAST: dailyCalories };
  }

  if (mealsPerDay === 2) {
    return {
      BREAKFAST: dailyCalories * 0.4,
      LUNCH: dailyCalories * 0.6
    };
  }

  if (mealsPerDay === 3) {
    return {
      BREAKFAST: dailyCalories * 0.25,
      LUNCH: dailyCalories * 0.4,
      DINNER: dailyCalories * 0.35
    };
  }

  if (mealsPerDay === 4) {
    return {
      BREAKFAST: dailyCalories * 0.2,
      LUNCH: dailyCalories * 0.35,
      DINNER: dailyCalories * 0.3,
      SNACK: dailyCalories * 0.15
    };
  }

  throw new Error('mealsPerDay must be between 1 and 4');
};

const filterRecipes = async ({ dietType, cuisine, maxCookingTime }) => {
  const filter = {};

  if (dietType) {
    filter.dietType = { $regex: new RegExp(`^${escapeRegExp(dietType)}$`, 'i') };
  }

  if (cuisine) {
    filter.cuisine = { $regex: new RegExp(`^${escapeRegExp(cuisine)}$`, 'i') };
  }

  if (maxCookingTime !== undefined) {
    filter.prepTime = { $lte: maxCookingTime };
  }

  return Recipe.find(filter)
    .select('title calories mealTypes')
    .lean();
};

const findClosestRecipe = (recipes, targetCalories) => {
  if (recipes.length === 0) {
    return null;
  }

  let smallestDifference = Infinity;
  let closestRecipes = [];

  recipes.forEach((recipe) => {
    const difference = Math.abs(recipe.calories - targetCalories);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestRecipes = [recipe];
    } else if (difference === smallestDifference) {
      closestRecipes.push(recipe);
    }
  });

  return closestRecipes[Math.floor(Math.random() * closestRecipes.length)];
};

const pickRecipe = (recipes, mealType, targetCalories, usedRecipeIds) => {
  const matchingRecipes = recipes.filter((recipe) => (
    Array.isArray(recipe.mealTypes) &&
    recipe.mealTypes.some((recipeMealType) => (
      String(recipeMealType).trim().toUpperCase() === mealType
    ))
  ));

  const unusedCandidates = matchingRecipes.filter((recipe) => (
    !usedRecipeIds.has(recipe._id.toString())
  ));

  // Prefer unused recipes, but allow repeats when the unique pool is exhausted.
  const candidates = unusedCandidates.length > 0 ? unusedCandidates : matchingRecipes;

  if (candidates.length === 0) {
    return null;
  }

  const selectedRecipe = findClosestRecipe(candidates, targetCalories);
  usedRecipeIds.add(selectedRecipe._id.toString());

  return selectedRecipe;
};

const generateMealPlan = async ({
  userId,
  dietType,
  dailyCalories,
  mealsPerDay,
  cuisine,
  maxCookingTime
}) => {
  const recipes = await filterRecipes({ dietType, cuisine, maxCookingTime });

  console.log('Meal plan recipes matched:', {
    count: recipes.length,
    mealTypes: [...new Set(recipes.flatMap((recipe) => recipe.mealTypes || []))]
  });

  const selectedMealTypes = MEAL_TYPES.slice(0, mealsPerDay);
  const calorieDistribution = getCalorieDistribution(dailyCalories, mealsPerDay);
  const usedRecipeIds = new Set();
  const generatedDays = DAY_NAMES.map((day) => {
    const meals = selectedMealTypes.map((mealType) => {
      const recipe = pickRecipe(
        recipes,
        mealType,
        calorieDistribution[mealType],
        usedRecipeIds
      );

      if (!recipe) {
        throw new Error(`No ${mealType.toLowerCase()} recipe matches the requested filters`);
      }

      return {
        mealType,
        recipe: {
          _id: recipe._id,
          title: recipe.title,
          calories: recipe.calories
        }
      };
    });

    return {
      day: `${day[0]}${day.slice(1).toLowerCase()}`,
      meals,
      totalCalories: meals.reduce((total, meal) => total + meal.recipe.calories, 0)
    };
  });

  await saveMealPlan(
    userId,
    new Date(),
    generatedDays.map((day) => ({
      day: day.day,
      meals: day.meals.map((meal) => ({
        mealType: meal.mealType,
        recipe: meal.recipe._id
      })),
      totalCalories: day.totalCalories
    })),
    {
      dietType,
      cuisine,
      dailyCalories,
      mealsPerDay,
      maxCookingTime
    }
  );

  return {
    dailyCaloriesTarget: dailyCalories,
    days: generatedDays.map((day) => ({
      day: day.day,
      meals: day.meals.map((meal) => ({
        mealType: meal.mealType,
        recipe: {
          title: meal.recipe.title,
          calories: meal.recipe.calories
        }
      })),
      totalCalories: day.totalCalories
    }))
  };
};

const getWeekStartDate = (date = new Date()) => {
  const weekStartDate = new Date(date);
  const day = weekStartDate.getUTCDay();
  const daysFromMonday = (day + 6) % 7;

  weekStartDate.setUTCDate(weekStartDate.getUTCDate() - daysFromMonday);
  weekStartDate.setUTCHours(0, 0, 0, 0);

  return weekStartDate;
};

const normalizeDays = (days = []) => days.map((day) => ({
  day: day.day,
  meals: day.meals || [],
  totalCalories: day.totalCalories
}));

const getMealPlan = async (userId, weekStartDate = new Date()) => {
  return MealPlan.findOne({
    user: userId,
    weekStartDate: getWeekStartDate(weekStartDate)
  }).populate('days.meals.recipe');
};

const saveMealPlan = async (userId, weekStartDate, days, preferences) => {
  const normalizedWeekStartDate = getWeekStartDate(weekStartDate);
  const normalizedDays = normalizeDays(days);

  return MealPlan.findOneAndUpdate(
    {
      user: userId,
      weekStartDate: normalizedWeekStartDate
    },
    {
      user: userId,
      weekStartDate: normalizedWeekStartDate,
      days: normalizedDays,
      preferences
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  ).populate('days.meals.recipe');
};

const deleteMealPlan = async (userId, weekStartDate = new Date()) => {
  return MealPlan.findOneAndDelete({
    user: userId,
    weekStartDate: getWeekStartDate(weekStartDate)
  });
};

module.exports = {
  getCalorieDistribution,
  filterRecipes,
  findClosestRecipe,
  getWeekStartDate,
  getMealPlan,
  saveMealPlan,
  deleteMealPlan,
  generateMealPlan
};
