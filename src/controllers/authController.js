const crypto = require("crypto");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const User = require("../models/User");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendMail } = require("../utils/sendMail");

// Register user
exports.registerUser = asyncMiddleware(async (req, res, next) => {
  const { email, name, password } = req.body;

  const isNewUser = await User.findOne({ email: email });

  if (isNewUser) {
    return next(new ErrorHandler(409, "Email already registered."));
  }

  const user = new User({
    name,
    email,
    password,
  });

  await user.save();
  const token = await user.generateToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(201)
    .cookie("token", token, options)
    .json({ success: true, message: "User registered successfully." });
});

// Login user
exports.loginUser = asyncMiddleware(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new ErrorHandler(401, "Invalid credentials."));
  }

  const isPassMatch = user.matchPassword(password);
  if (!isPassMatch) {
    return next(new ErrorHandler(401, "Invalid credentials."));
  }

  const token = user.generateToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("token", token, options)
    .json({ success: true, message: "Logged in successfully." });
});

// Login admin
exports.loginAdmin = asyncMiddleware(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new ErrorHandler(401, "Invalid credentials."));
  }

  const isPassMatch = user.matchPassword(password);
  if (!isPassMatch) {
    return next(new ErrorHandler(401, "Invalid credentials."));
  }

  if (user.role !== "admin") {
    return next(new ErrorHandler(401, "You are not Admin."));
  }

  const token = user.generateToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(200)
    .cookie("token", token, options)
    .json({ success: true, message: "Logged in successfully." });
});

// Logout user
exports.logoutUser = asyncMiddleware(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot password
exports.forgotPassword = asyncMiddleware(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler(404, "User not found."));
  }

  // generate password reset Token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const url = `${process.env.FRONT_END_URL}/password/reset/${resetToken}`;
  try {
    await sendMail({
      to: user.email,
      subject: "Perfect Fit Password Recovery",
      type: "password_reset",
      url: url,
      message: `Your password reset token is : \n\n ${url} \n\nIf you have not requested this email then, please ignore it.`,
    });

    res.status(200).json({
      success: true,
      message: `Password reset link send to ${user.email}.`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(500, error.message));
  }
});

// Reset password
exports.resetPassword = asyncMiddleware(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const isMatch = password === confirmPassword;

  if (!isMatch) {
    return next(
      new ErrorHandler(400, "Password and Confirm password should be same.")
    );
  }

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(400, "Reset token is invalid or has been expired.")
    );
  }

  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  user.password = req.body.password;
  user.save();

  res
    .status(200)
    .json({ success: true, message: "Password changed successfully." });
});
