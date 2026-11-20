const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler, fail } = require("../utils/helpers");

const getToken = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.split(" ")[1] : null;
};

// Blocks the request unless a valid token is sent. Puts the logged-in user on req.user.
const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) fail(res, 401, "Please log in to continue");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    fail(res, 401, "Your session has expired. Please log in again");
  }

  const user = await User.findById(decoded.id);
  if (!user) fail(res, 401, "This account no longer exists");

  req.user = user;
  next();
});

// Same as protect, but lets anonymous visitors through (used on public pages that
// show extra info, like "your rating", to logged-in users).
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // invalid token: treat as logged out
    }
  }
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403);
  next(new Error("Admin access only"));
};

module.exports = { protect, optionalAuth, adminOnly };
