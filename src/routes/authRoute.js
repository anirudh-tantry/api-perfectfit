const router = require("express").Router();
const {
  registerUser,
  loginUser,
  loginAdmin,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);


// LOGOUT
router.post("/logout", logoutUser);

// Forgot password
router.post("/password/reset", forgotPassword);

// Reset password
router.post("/password/reset/:token", resetPassword);

module.exports = router;
