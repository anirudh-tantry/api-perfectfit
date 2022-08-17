const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    landingPageUrl: String,
    productId: { type: Number, unique: true },
    name: {
      type: String,
      required: [true, "Product name cannot be blank"],
    },
    brand: { type: String, required: [true, "Brand name cannot be blank"] },
    description: { type: String },
    additionalInfo: { type: String },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    mrp: { type: Number, required: [true, "MRP cannot be blank"] },
    price: { type: Number, required: [true, "Price cannot be blank"] },
    gender: { type: String },
    category: { type: String, required: [true, " Category cannot be blank"] },
    stock: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountDisplayLabel: String,
    displayImage: String,
    Images: [String],
    inventoryInfo: [{ size: String, stock: Number, available: Boolean }],
    sizes: String,
    reviews: [
      {
        userId: { type: String, required: true },
        rating: { type: Number, required: true },
        date: { type: Date, default: Date.now() },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
