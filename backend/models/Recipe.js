const mongoose = require("mongoose");
const { CATEGORIES } = require("../config/constants");

// One rating per user: the controller updates the existing entry instead of adding another.
const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true, trim: true, maxlength: 300 },
  createdAt: { type: Date, default: Date.now },
});

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Recipe name is required"], trim: true, maxlength: 100 },
    description: { type: String, required: [true, "Description is required"], trim: true, maxlength: 1000 },
    ingredients: { type: [String], validate: [(v) => v.length > 0, "Add at least one ingredient"] },
    steps: { type: [String], validate: [(v) => v.length > 0, "Add at least one cooking step"] },
    category: { type: String, enum: CATEGORIES, required: [true, "Category is required"] },
    prepTime: { type: Number, required: true, min: 0 },
    cookTime: { type: Number, required: true, min: 0 },
    servings: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, trim: true, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratings: [ratingSchema],
    reports: [reportSchema],
    isSample: { type: Boolean, default: false }, // true for recipes created by the seed script
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
