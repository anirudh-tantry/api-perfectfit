const asyncMiddleware = require("../middlewares/asyncMiddleware");
const Razorpay = require("razorpay");
const crypto = require("crypto");

require("dotenv").config();

const Instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

exports.newPayment = asyncMiddleware(async (req, res, next) => {
  const options = {
    amount: req.body.amount * 100,
    currency: "INR",
  };

  const order = await Instance.orders.create(options);
  res.status(200).json({ success: true, order });
});

// Verify Payment
exports.verifyPayment = asyncMiddleware(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  const isPaid = signature === razorpay_signature;
  if (isPaid) {
    res.status(200).json({success: true, message: "Payment success."})
  }
  else{
    res.status(403).json({ success: false, message: "Payment authentication failed." });
  }
});

// Get API KEY
exports.getKey = async (req, res, next) => {
  res.status(200).json({ success: true, key: process.env.RAZORPAY_API_KEY });
};
