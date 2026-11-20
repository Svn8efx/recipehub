const mongoose = require("mongoose");
const { DAYS, MEAL_TYPES } = require("../config/constants");

// Each user has one meal plan document. Each entry is one slot, e.g. Monday + Lunch.
const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  entries: [
    {
      day: { type: String, enum: DAYS, required: true },
      mealType: { type: String, enum: MEAL_TYPES, required: true },
      recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
    },
  ],
});

module.exports = mongoose.model("MealPlan", mealPlanSchema);
