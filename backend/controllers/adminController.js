const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const { asyncHandler, fail } = require("../utils/helpers");
const { removeRecipeEverywhere } = require("./recipeController");

// GET /api/admin/reports  -> recipes that have at least one report
const getReportedRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ "reports.0": { $exists: true } })
    .select("title imageUrl category author reports")
    .populate("author", "name")
    .populate("reports.user", "name");
  res.json({ recipes });
});

// DELETE /api/admin/reports/:recipeId  -> dismiss: keep the recipe, clear its reports
const dismissReports = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.recipeId)) fail(res, 404, "Recipe not found");
  const result = await Recipe.updateOne({ _id: req.params.recipeId }, { $set: { reports: [] } });
  if (result.matchedCount === 0) fail(res, 404, "Recipe not found");
  res.json({ message: "Reports dismissed" });
});

// DELETE /api/admin/recipes/:recipeId  -> remove the reported recipe
const removeRecipe = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.recipeId)) fail(res, 404, "Recipe not found");
  if (!(await Recipe.exists({ _id: req.params.recipeId }))) fail(res, 404, "Recipe not found");
  await removeRecipeEverywhere(req.params.recipeId);
  res.json({ message: "Recipe removed" });
});

module.exports = { getReportedRecipes, dismissReports, removeRecipe };
