const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should be greater than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please enter valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide users password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      // required: true,
    },
    url: {
      type: String,
      // required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

//JWT Token Authentication
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Comapre Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  // console.log(enteredPassword, this.password);
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generating Password reset Token Authentication
userSchema.methods.getResetPasswordToken = function () {
  //Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and adding resetPasswordToken to Schema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("User", userSchema);
