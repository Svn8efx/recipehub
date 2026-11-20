// Aggregation stages reused wherever we return recipes.
// 1. $addFields calculates the average rating and number of ratings with $avg and $size.
// 2. $lookup joins the author's name from the users collection.
// 3. $project removes the raw ratings and reports so they are not sent to everyone.
const ratingAndAuthorStages = [
  {
    $addFields: {
      averageRating: { $ifNull: [{ $avg: "$ratings.value" }, 0] },
      ratingCount: { $size: "$ratings" },
    },
  },
  { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
  { $unwind: "$author" },
  { $addFields: { author: { _id: "$author._id", name: "$author.name" } } },
  { $project: { ratings: 0, reports: 0 } },
];

module.exports = { ratingAndAuthorStages };
