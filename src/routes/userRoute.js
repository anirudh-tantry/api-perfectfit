const router = require("express").Router();
const {
  me,
  updateMe,
  deleteMe,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserAnalytics,
  totalUsers,
} = require("../controllers/userController");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

// user route
router
  .route("/me")
  .get(isAuthenticated, me)
  .put(isAuthenticated, updateMe)
  .delete(isAuthenticated, deleteMe);

// get all users - admin
router.get(
  "/admin/users",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsers
);

// get user analytics
router.get(
  "/admin/users/stats",
  isAuthenticated,
  authorizeRoles("admin"),
  getUserAnalytics
);

// single user route - admin
router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizeRoles("admin"), getUser)
  .put(isAuthenticated, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUser);

// get total users - admin
router.get("/admin/users/total", isAuthenticated, authorizeRoles("admin"), totalUsers);

module.exports = router;
