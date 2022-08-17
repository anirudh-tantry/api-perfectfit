const {
  newPayment,
  getKey,
  verifyPayment,
} = require("../controllers/paymentController");

const router = require("express").Router();

router.route("/").post(newPayment);
router.route("/verify").post(verifyPayment);
router.route("/apikey").get(getKey);

module.exports = router;
