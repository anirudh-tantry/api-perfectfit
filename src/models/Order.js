const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Processing" },
    paymentStatus: { type: String, default : "pending"},
    razorpay_payment_id: String,
    razorpay_order_id: String,
    razorpay_signature: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
