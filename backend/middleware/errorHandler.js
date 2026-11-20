const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";

  // Mongoose validation error: combine the messages
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  // Invalid ObjectId in the URL
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  }
  // Duplicate unique field (e.g. email)
  if (err.code === 11000) {
    status = 400;
    message = "That value is already in use";
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
