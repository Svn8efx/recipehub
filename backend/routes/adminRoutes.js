const express = require("express");
const { getReportedRecipes, dismissReports, removeRecipe } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();
router.use(protect, adminOnly); // logged in AND role === "admin"

router.get("/reports", getReportedRecipes);
router.delete("/reports/:recipeId", dismissReports);
router.delete("/recipes/:recipeId", removeRecipe);

module.exports = router;
