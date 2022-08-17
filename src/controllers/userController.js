const bcrypt = require("bcrypt");
const User = require("../models/User");
const asyncMiddleware = require("../middlewares/asyncMiddleware");

// -------------------- Current User --------------------

// GET user - me
exports.me = asyncMiddleware(async (req, res, next) => {
  const user = await User.findById(req.user._id).select( { password: 0, createdAt: 0, updatedAt: 0 } );
  res.status(200).json({ success: true, user });
});

// UPDATE user - me
exports.updateMe = asyncMiddleware(async (req, res, next) => {
  const { password } = req.body;
  if (password) {
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    req.body.password = await bcrypt.hash(password, salt);
  }
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  res
    .status(200)
    .json({ success: true, message: "User updated successfully." });
});

// DELETE user - me
exports.deleteMe = asyncMiddleware(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user._id);
  res.status(200).json({ success: true, message: "User deleted." });
});

// -------------------------- Admin -----------------------------

// GET all users - admin
exports.getAllUsers = asyncMiddleware(async (req, res, next) => {
  const l = req.query.l || 50;
  const p = req.query.p || 1;
  const users = await User.find().sort("-createdAt").limit(l).skip((p-1) * l);
  res.status(200).json({ success: true, users });
});

// GET user - admin
exports.getUser = asyncMiddleware(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new Error(404, "User not found."));
  }

  res.status(200).json({ success: true, user });
});

// UPDATE user (only role, name and email) - admin
exports.updateUser = asyncMiddleware(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  });

  res
    .status(200)
    .json({ success: true, message: "User updated successfully." });
});

// DELETE user - admin
exports.deleteUser = asyncMiddleware(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new Error(404, "User not found."));
  }
  res.status(200).json({ success: true, message: "User deleted." });
});


// GET user analytics
exports.getUserAnalytics = asyncMiddleware(async (req, res, next) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1}
      }
    ]);
    res.status(200).json(data);

});

exports.totalUsers = asyncMiddleware(async (req, res, next) => {
  const total = await User.countDocuments();

  res.status(200).json(total);
});