const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    ingredients: {
      type: [String],
      required: true
    },
    steps: {
      type: [String],
      required: true
    },
    cuisine: {
      type: String,
      required: true,
      index: true
    },
    prepTime: {
      type: Number,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    avgRating: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);
