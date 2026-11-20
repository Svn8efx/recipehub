const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");
const User = require("../models/User");
const MealPlan = require("../models/MealPlan");
const { CATEGORIES } = require("../config/constants");
const { asyncHandler, fail } = require("../utils/helpers");
const { ratingAndAuthorStages } = require("../utils/recipeStages");

// Makes user text safe to use inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Checks the recipe form data and returns cleaned data, or an error message
const readRecipeInput = (body) => {
  const toList = (value) => (Array.isArray(value) ? value : []).map((item) => String(item).trim()).filter(Boolean);

  const data = {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    ingredients: toList(body.ingredients),
    steps: toList(body.steps),
    category: body.category,
    prepTime: Number(body.prepTime),
    cookTime: Number(body.cookTime),
    servings: Number(body.servings),
    imageUrl: String(body.imageUrl || "").trim(),
  };

  let error = null;
  if (!data.title) error = "Recipe name is required";
  else if (!data.description) error = "Description is required";
  else if (data.ingredients.length === 0) error = "Add at least one ingredient";
  else if (data.steps.length === 0) error = "Add at least one cooking step";
  else if (!CATEGORIES.includes(data.category)) error = "Choose a valid category";
  else if (!(data.prepTime >= 0)) error = "Preparation time must be 0 or more minutes";
  else if (!(data.cookTime >= 0)) error = "Cooking time must be 0 or more minutes";
  else if (!(data.servings >= 1)) error = "Servings must be at least 1";
  else if (data.imageUrl && !/^https?:\/\/\S+$/i.test(data.imageUrl)) error = "Image URL must start with http:// or https://";

  return { data, error };
};

// Deletes a recipe and cleans up everything that points to it
const removeRecipeEverywhere = async (recipeId) => {
  await Comment.deleteMany({ recipe: recipeId });
  await User.updateMany({ favourites: recipeId }, { $pull: { favourites: recipeId } });
  await MealPlan.updateMany({}, { $pull: { entries: { recipe: recipeId } } });
  await Recipe.deleteOne({ _id: recipeId });
};

// GET /api/recipes?search=&ingredient=&category=&page=&limit=
const getRecipes = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 8, 1), 24);

  const filter = {};
  if (req.query.search) filter.title = { $regex: escapeRegex(String(req.query.search).trim()), $options: "i" };
  if (req.query.ingredient) filter.ingredients = { $regex: escapeRegex(String(req.query.ingredient).trim()), $options: "i" };
  if (CATEGORIES.includes(req.query.category)) filter.category = req.query.category;

  const total = await Recipe.countDocuments(filter);
  const recipes = await Recipe.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1, _id: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    ...ratingAndAuthorStages,
  ]);

  res.json({ recipes, page, totalPages: Math.ceil(total / limit), total });
});

// GET /api/recipes/options  (id + title of every recipe, used by the meal planner dropdowns)
const getRecipeOptions = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find().select("title").sort({ title: 1 });
  res.json({ recipes });
});

// GET /api/recipes/:id
const getRecipe = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) fail(res, 404, "Recipe not found");

  const [recipe] = await Recipe.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ...ratingAndAuthorStages,
  ]);
  if (!recipe) fail(res, 404, "Recipe not found");

  // If someone is logged in, also send their own rating (0 = not rated yet)
  recipe.myRating = 0;
  if (req.user) {
    const doc = await Recipe.findById(id).select("ratings");
    const mine = doc.ratings.find((rating) => rating.user.equals(req.user._id));
    if (mine) recipe.myRating = mine.value;
  }

  res.json({ recipe });
});

// POST /api/recipes
const createRecipe = asyncHandler(async (req, res) => {
  const { data, error } = readRecipeInput(req.body);
  if (error) fail(res, 400, error);

  const recipe = await Recipe.create({ ...data, author: req.user._id });
  res.status(201).json({ recipe });
});

// PUT /api/recipes/:id  (only the author)
const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) fail(res, 404, "Recipe not found");
  if (!recipe.author.equals(req.user._id)) fail(res, 403, "You can only edit your own recipes");

  const { data, error } = readRecipeInput(req.body);
  if (error) fail(res, 400, error);

  Object.assign(recipe, data);
  await recipe.save();
  res.json({ recipe });
});

// DELETE /api/recipes/:id  (the author, or an admin)
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) fail(res, 404, "Recipe not found");

  const isAuthor = recipe.author.equals(req.user._id);
  if (!isAuthor && req.user.role !== "admin") fail(res, 403, "You can only delete your own recipes");

  await removeRecipeEverywhere(recipe._id);
  res.json({ message: "Recipe deleted" });
});

// POST /api/recipes/:id/rate   body: { value: 1-5 }
const rateRecipe = asyncHandler(async (req, res) => {
  const value = Number(req.body.value);
  if (!Number.isInteger(value) || value < 1 || value > 5) fail(res, 400, "Rating must be a whole number from 1 to 5");

  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) fail(res, 404, "Recipe not found");

  // A user has one rating per recipe: update it if it exists, otherwise add it.
  const existing = recipe.ratings.find((rating) => rating.user.equals(req.user._id));
  if (existing) existing.value = value;
  else recipe.ratings.push({ user: req.user._id, value });
  await recipe.save();

  // Calculate the new average with an aggregation
  const [result] = await Recipe.aggregate([
    { $match: { _id: recipe._id } },
    { $project: { averageRating: { $ifNull: [{ $avg: "$ratings.value" }, 0] }, ratingCount: { $size: "$ratings" } } },
  ]);

  res.json({ averageRating: result.averageRating, ratingCount: result.ratingCount, myRating: value });
});

// GET /api/recipes/:id/comments
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ recipe: req.params.id }).populate("user", "name").sort({ createdAt: -1 });
  res.json({ comments });
});

// POST /api/recipes/:id/comments
const addComment = asyncHandler(async (req, res) => {
  const text = String(req.body.text || "").trim();
  if (!text) fail(res, 400, "Comment cannot be empty");
  if (text.length > 500) fail(res, 400, "Comment must be 500 characters or less");

  const recipe = await Recipe.exists({ _id: req.params.id });
  if (!recipe) fail(res, 404, "Recipe not found");

  const comment = await Comment.create({ recipe: req.params.id, user: req.user._id, text });
  res.status(201).json({ comment });
});

// DELETE /api/recipes/:id/comments/:commentId  (the commenter, or an admin)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({ _id: req.params.commentId, recipe: req.params.id });
  if (!comment) fail(res, 404, "Comment not found");
  if (!comment.user.equals(req.user._id) && req.user.role !== "admin") fail(res, 403, "You can only delete your own comments");

  await comment.deleteOne();
  res.json({ message: "Comment deleted" });
});

// POST /api/recipes/:id/report   body: { reason }
const reportRecipe = asyncHandler(async (req, res) => {
  const reason = String(req.body.reason || "").trim();
  if (!reason) fail(res, 400, "Please tell us why you are reporting this recipe");
  if (reason.length > 300) fail(res, 400, "Reason must be 300 characters or less");

  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) fail(res, 404, "Recipe not found");
  if (recipe.author.equals(req.user._id)) fail(res, 400, "You cannot report your own recipe");
  if (recipe.reports.some((report) => report.user.equals(req.user._id))) fail(res, 400, "You have already reported this recipe");

  recipe.reports.push({ user: req.user._id, reason });
  await recipe.save();
  res.status(201).json({ message: "Thank you. An admin will review this recipe." });
});

module.exports = {
  getRecipes,
  getRecipeOptions,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
  getComments,
  addComment,
  deleteComment,
  reportRecipe,
  removeRecipeEverywhere,
};
