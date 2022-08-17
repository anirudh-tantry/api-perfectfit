const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProduct,
  rateProduct,
  getCurrentRating,
  totalProducts,
} = require("../controllers/productController");

const {
  isAuthenticated,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = require("express").Router();

router
  .route("/")
  .post(isAuthenticated, authorizeRoles("admin"), createProduct)
  .get(getAllProducts);

router
  .route("/:productId")
  .get(getProduct)
  // admin route
  .put(isAuthenticated, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProduct);

router.get("/admin/total", isAuthenticated, authorizeRoles("admin"), totalProducts);

// rating Product
router.route("/rate").post(isAuthenticated, rateProduct);

router.get("/rate/:productId", isAuthenticated, getCurrentRating);

module.exports = router;
