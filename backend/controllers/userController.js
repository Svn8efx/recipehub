const Recipe = require("../models/Recipe");
const { asyncHandler } = require("../utils/helpers");
const { ratingAndAuthorStages } = require("../utils/recipeStages");

// GET /api/users/profile  -> the logged-in user's details and their recipes
const getProfile = asyncHandler(async (req, res) => {
  const recipes = await Recipe.aggregate([
    { $match: { author: req.user._id } },
    { $sort: { createdAt: -1 } },
    ...ratingAndAuthorStages,
  ]);

  res.json({
    user: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
    recipes,
  });
});

module.exports = { getProfile };
