const express = require("express");
const c = require("../controllers/recipeController");
const { protect, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", c.getRecipes);
router.post("/", protect, c.createRecipe);
router.get("/options", c.getRecipeOptions); // must stay above "/:id"

router.get("/:id", optionalAuth, c.getRecipe);
router.put("/:id", protect, c.updateRecipe);
router.delete("/:id", protect, c.deleteRecipe);

router.post("/:id/rate", protect, c.rateRecipe);
router.post("/:id/report", protect, c.reportRecipe);

router.get("/:id/comments", c.getComments);
router.post("/:id/comments", protect, c.addComment);
router.delete("/:id/comments/:commentId", protect, c.deleteComment);

module.exports = router;
