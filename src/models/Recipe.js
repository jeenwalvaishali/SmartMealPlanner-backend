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
    imagePublicId: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        value: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],
    avgRating: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

recipeSchema.methods.calculateAvgRating = function () {
  if (this.ratings.length === 0) {
    this.avgRating = 0;
    return;
  }

  const total = this.ratings.reduce((sum, r) => sum + r.value, 0);
  this.avgRating = total / this.ratings.length;
};

recipeSchema.index({ 'ratings.user': 1, _id: 1 });

recipeSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
