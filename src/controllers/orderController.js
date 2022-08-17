const Order = require("../models/Order");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const ErrorHandler = require("../utils/ErrorHandler");

//CREATE Order
exports.createOrder = asyncMiddleware(async (req, res, next) => {
  const newOrder = new Order({...req.body, user: req.user._id});
  await newOrder.save();
  res
    .status(200)
    .json({ success: true, message: "Order placed successfully." });
});

//UPDATE Order
exports.updateOrder = asyncMiddleware(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler(404, "Order not found."));
  }
  await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  );
  res
    .status(200)
    .json({ success: true, message: "Order updated successfully." });
});

//DELETE Order
exports.deleteOrder = asyncMiddleware(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler(404, "Order not found."));
  }

  await Order.findByIdAndDelete(req.params.id);
  res.status(200).json("Order successfully deleted.");
});

//GET SINGLE ORDER
exports.getSingleOrder = asyncMiddleware(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email address").populate("products.product", "productId brand category name additionalInfo");

  if (!order) {
    return next(new ErrorHandler(404, "No Order found."));
  }

  res.status(200).json({ success: true, order });
});

//GET USER ORDERS
exports.getUserOrders = asyncMiddleware(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).populate("user", "name email address").populate("products.product", "productId brand category name additionalInfo").sort("-createdAt");

  if (!orders.length > 0) {
    return next(new ErrorHandler(404, "No Order found."));
  }

  res.status(200).json({ success: true, orders });
});

// //GET ALL

exports.getAllOrders = asyncMiddleware(async (req, res, next) => {
  const l = req.query.l || 20;
  const p = req.query.p || 1;
  const orders = await Order.find().limit(l).skip((p-1) * l).populate("user", "name email address").populate("products.product", "productId brand category name additionalInfo").sort("-createdAt");
  res.status(200).json(orders);
});

// GET MONTHLY INCOME

exports.getMonthlyOrdersAndIncome = asyncMiddleware(async (req, res, next) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  const income = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: previousMonth },
        ...(productId && {
          products: { $elemMatch: { productId } },
        }),
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        sales: "$amount",
      },
    },
    {
      $group: {
        _id: "$month",
        total: { $sum: "$sales" },
      },
    },
    {
    $sort : { _id: -1 }
  }
  ]);
  res.status(200).json({ success: true, income });
});
