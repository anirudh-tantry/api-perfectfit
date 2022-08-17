const Cart = require("../models/Cart");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const ErrorHandler = require("../utils/ErrorHandler");

// Add to Cart
exports.addToCart = asyncMiddleware(async (req, res, next) => {
  // Check if cart with that user exists or not
  const userCart = await Cart.findOne({ user: req.user._id });

  // there is no cart of that user create one
  if (!userCart) {
    const add = new Cart({
      user: req.user._id,
      cartItems: [{ product: req.body.product }],
    });
    await add.save();
    res
      .status(201)
      .json({ success: true, quantity: 1, message: "Product added to cart successfully." });
  }

  // if cart with that user already exists
  else {
    // check if that product exists in the cart
    const product = await Cart.findOne({
      user: req.user._id,
      cartItems: { $elemMatch: { product: req.body.product } },
    });

    // if product already exists in the cart increase the quantity by 1
    if (product) {
      await Cart.updateOne(
        {
          user: req.user._id,
          cartItems: { $elemMatch: { product: req.body.product } },
        },
        { $inc: { "cartItems.$.quantity": 1 } },
        { new: true }
      );

      res.status(201).json({
        success: true,
        quantity: userCart.cartItems.length,
        message: "Product added to cart successfully.",
      });
    }

    // if product not exists in the cart add the product to cart
    else {
      await Cart.updateOne(
        { user: req.user._id },
        {
          $push: {
            cartItems: [{ product: req.body.product }],
          },
        }
      );

      res.status(201).json({
        success: true,
        quantity: userCart.cartItems.length + 1,
        message: "Product added to cart successfully.",
      });
    }
  }
});

// UPDATE Cart Item - only quantity
exports.updateCartItem = asyncMiddleware(async (req, res, next) => {
  await Cart.updateOne(
    { "cartItems._id": req.body.id },
    { $set: { "cartItems.$.quantity": req.body.quantity } }
  );

  const cart = await Cart.findOne({user: req.user._id}).populate(
    "cartItems.product",
    "productId additionalInfo displayImage price brand landingPageUrl");

  res
    .status(200)
    .json({ success: true, message: "Cart updated.", cart });
});

// DELETE Cart Item
exports.deleteCartItem = asyncMiddleware(async (req, res, next) => {
  await Cart.updateOne(
    { "cartItems._id": req.body.id },
    { $pull: { cartItems: { _id: req.body.id } } }
  );

  const cart = await Cart.findOne({user: req.user._id}).populate(
    "cartItems.product",
    "productId additionalInfo displayImage price brand landingPageUrl");

  res
    .status(200)
    .json({ success: true, message: "Product removed from cart.", cart });
});

// Get Cart Items
exports.cart = asyncMiddleware(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "cartItems.product",
    "productId additionalInfo displayImage price brand landingPageUrl"
    // "productId name brand landingPageUrl mrp price discount displayImage discountDisplayLabel"
  );

  res.status(200).json({ success: true, cart });
});

// Empty Cart
exports.emptyCart = asyncMiddleware(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  cart.remove();

  res.status(200).json({ success: true, cart: null });
});