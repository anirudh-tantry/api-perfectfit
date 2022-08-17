const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required."],
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required."],
    },
    // lastName: {
    //   trim: true,
    //   type: String,
    // },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    role: {
      type: String,
      default: "user",
    },
    // address: String,
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash Password Function
userSchema.methods.hashPassword = (password) => {
  return bcrypt.hashSync(
    password,
    bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS))
  );
};

// Compare Password Function
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compareSync(password.trim(), this.password);
};

// JWT token generation Function
userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
};

// Generate Password Reset Token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto
    .randomBytes(Number(process.env.SALT_ROUNDS))
    .toString("hex");

  // Hash and store password reset token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // store expire time
  this.passwordResetExpire = new Date(Date.now() + 900000);
  return resetToken;
};

// Pre-save hash password
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = this.hashPassword(this.password.trim());
  next();
});

module.exports = mongoose.model("User", userSchema);
