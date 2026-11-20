const express = require("express");
const { getMealPlan, setMeal, removeMeal } = require("../controllers/mealPlanController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", getMealPlan);
router.put("/", setMeal);
router.delete("/:day/:mealType", removeMeal);

module.exports = router;
