const mongoose = require("mongoose");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const { asyncHandler, fail } = require("../utils/helpers");
const { ratingAndAuthorStages } = require("../utils/recipeStages");

// GET /api/favourites
const getFavourites = asyncHandler(async (req, res) => {
  const recipes = await Recipe.aggregate([
    { $match: { _id: { $in: req.user.favourites } } },
    { $sort: { title: 1 } },
    ...ratingAndAuthorStages,
  ]);
  res.json({ recipes });
});

// POST /api/favourites/:recipeId
const addFavourite = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  if (!mongoose.isValidObjectId(recipeId) || !(await Recipe.exists({ _id: recipeId }))) fail(res, 404, "Recipe not found");

  // $addToSet adds the id only if it is not already in the array
  const user = await User.findByIdAndUpdate(req.user._id, { $addToSet: { favourites: recipeId } }, { new: true });
  res.json({ favourites: user.favourites });
});

// DELETE /api/favourites/:recipeId
const removeFavourite = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $pull: { favourites: req.params.recipeId } }, { new: true });
  res.json({ favourites: user.favourites });
});

module.exports = { getFavourites, addFavourite, removeFavourite };
