//for token and user login authentication

const ErrorHander = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const  token  = req.cookies.token;
  if (!token) {
    return next(new ErrorHander("Please Login to access this resource", 401));
  }

  const decodeData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodeData.id);

  next();
});

exports.authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this Resource`,
          403
        )
      );
    }

    next();
  };
};
