const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorHandler = require("../utils/ErrorHandler");
const asyncMiddleware = require("./asyncMiddleware");

exports.isAuthenticated = asyncMiddleware(async (req, res, next) => {
  const { token } = req.cookies || req.headers.token?.split(" ")[1];
  console.log(token);

  if (!token) {
    return next(new ErrorHandler(401, "Unauthorized! Please log in."));
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedToken._id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(401, "You are not authorized to perform this action.")
      );
    }

    next();
  };
};
