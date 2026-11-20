const mongoose = require("mongoose");
const MealPlan = require("../models/MealPlan");
const Recipe = require("../models/Recipe");
const { DAYS, MEAL_TYPES } = require("../config/constants");
const { asyncHandler, fail } = require("../utils/helpers");

// Loads the user's planned meals with basic recipe details
const loadEntries = async (userId) => {
  const plan = await MealPlan.findOne({ user: userId }).populate("entries.recipe", "title imageUrl category cookTime");
  if (!plan) return [];
  return plan.entries.filter((entry) => entry.recipe); // skip recipes that no longer exist
};

// GET /api/mealplan
const getMealPlan = asyncHandler(async (req, res) => {
  res.json({ entries: await loadEntries(req.user._id) });
});

// PUT /api/mealplan   body: { day, mealType, recipeId }
// Sets a meal. If that day + meal type already has a recipe, it is replaced.
const setMeal = asyncHandler(async (req, res) => {
  const { day, mealType, recipeId } = req.body;
  if (!DAYS.includes(day)) fail(res, 400, "Choose a valid day");
  if (!MEAL_TYPES.includes(mealType)) fail(res, 400, "Choose Breakfast, Lunch or Dinner");
  if (!mongoose.isValidObjectId(recipeId) || !(await Recipe.exists({ _id: recipeId }))) fail(res, 404, "Recipe not found");

  const plan = (await MealPlan.findOne({ user: req.user._id })) || new MealPlan({ user: req.user._id });
  plan.entries = plan.entries.filter((entry) => !(entry.day === day && entry.mealType === mealType));
  plan.entries.push({ day, mealType, recipe: recipeId });
  await plan.save();

  res.json({ entries: await loadEntries(req.user._id) });
});

// DELETE /api/mealplan/:day/:mealType
const removeMeal = asyncHandler(async (req, res) => {
  const { day, mealType } = req.params;
  if (!DAYS.includes(day) || !MEAL_TYPES.includes(mealType)) fail(res, 400, "Invalid day or meal type");

  await MealPlan.updateOne({ user: req.user._id }, { $pull: { entries: { day, mealType } } });
  res.json({ entries: await loadEntries(req.user._id) });
});

module.exports = { getMealPlan, setMeal, removeMeal };
