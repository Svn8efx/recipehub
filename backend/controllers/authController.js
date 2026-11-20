const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler, fail } = require("../utils/helpers");

const createToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// The user data we send to the frontend (never the password)
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  favourites: user.favourites,
});

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (name.length < 2) fail(res, 400, "Name must be at least 2 characters");
  if (!/^\S+@\S+\.\S+$/.test(email)) fail(res, 400, "Please enter a valid email");
  if (password.length < 6) fail(res, 400, "Password must be at least 6 characters");

  const existing = await User.findOne({ email });
  if (existing) fail(res, 400, "An account with this email already exists");

  // Never store the plain password: hash it with bcrypt first.
  const hashedPassword = await bcrypt.hash(password, 10);
  // New accounts are always normal users. Admins are created by the seed script.
  const user = await User.create({ name, email, password: hashedPassword });

  res.status(201).json({ token: createToken(user), user: userResponse(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) fail(res, 400, "Email and password are required");

  const user = await User.findOne({ email }).select("+password");
  const passwordMatches = user && (await bcrypt.compare(password, user.password));
  if (!passwordMatches) fail(res, 401, "Incorrect email or password");

  res.json({ token: createToken(user), user: userResponse(user) });
});

// GET /api/auth/me  (used by the frontend to restore the session after a refresh)
const getMe = (req, res) => {
  res.json({ user: userResponse(req.user) });
};

module.exports = { register, login, getMe };
