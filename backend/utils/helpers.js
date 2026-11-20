// Lets us write async controllers without a try/catch in every one.
// Any error thrown inside is passed on to the error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Sets the HTTP status and throws an error with a message the frontend can show.
const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

module.exports = { asyncHandler, fail };
