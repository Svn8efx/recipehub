const express = require("express");
const { getFavourites, addFavourite, removeFavourite } = require("../controllers/favouriteController");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect); // every favourites route needs a logged-in user

router.get("/", getFavourites);
router.post("/:recipeId", addFavourite);
router.delete("/:recipeId", removeFavourite);

module.exports = router;
