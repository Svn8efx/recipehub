const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: [true, "Comment cannot be empty"], trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
