const router = require("express").Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const {
  addToCart,
  updateCartItem,
  deleteCartItem,
  cart,
  emptyCart,
} = require("../controllers/cartController");

// Cart routes
router.route("/").get(isAuthenticated, cart).post(isAuthenticated, addToCart);
router.put("/update", isAuthenticated, updateCartItem);
router.put("/delete", isAuthenticated, deleteCartItem);
router.delete("/empty", isAuthenticated, emptyCart);


module.exports = router;
