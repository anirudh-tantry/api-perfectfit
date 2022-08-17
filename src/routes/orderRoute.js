const router = require("express").Router();
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getSingleOrder,
  getUserOrders,
  getMonthlyOrdersAndIncome,
} = require("../controllers/orderController");

router
  .route("/")
  // user route
  .post(isAuthenticated, createOrder)
  // Admin route
  .get(isAuthenticated, authorizeRoles("admin"), getAllOrders);

// GET MONTHLY INCOME - admin
router.get(
  "/income",
  isAuthenticated,
  authorizeRoles("admin"),
  getMonthlyOrdersAndIncome
);

router
  .route("/:id")
  .get(isAuthenticated, getSingleOrder)
  .put(isAuthenticated, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteOrder);

// user and admin route
router.get("/find/:userId", isAuthenticated, getUserOrders);

module.exports = router;
