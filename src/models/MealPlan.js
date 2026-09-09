const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }
});

const dayPlanSchema = new mongoose.Schema({
  day: String,
  meals: [mealSchema],
  totalCalories: Number
});

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    weekStartDate: {
      type: Date,
      index: true
    },
    preferences: {
      dietType: String,
      cuisine: String,
      dailyCalories: Number,
      mealsPerDay: Number,
      maxCookingTime: Number
    },
    days: [dayPlanSchema]
  },
  { timestamps: true }
);

mealPlanSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
