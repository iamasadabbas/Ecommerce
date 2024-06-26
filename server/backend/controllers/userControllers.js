const ErrorHander = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const cloudnary = require("cloudinary");
const crypto = require("crypto");

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const myCloud = await cloudnary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: "150",
    crop: "scale",
  });

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res);
  //below comments are moved to a seperate file in the above line
  // const token = user.getJWTToken();

  // res.status(201).json({
  //   status: true,
  //   token,
  // });
});

//For Login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHander("Please Provide a valid email", 400));
  }

  const userdata = await User.findOne({ email }).select("+password");

  if (!userdata) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatch = await userdata.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHander("Invalid Email or password", 401));
  }

  sendToken(userdata, 200, res);

  //below comments are moved to a seperate file in the above line

  // const token = userdata.getJWTToken();

  // res.status(200).json({
  //   status: true,
  //   token,
  // });
});

//For Logout
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httponly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

//Forget Password
exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User Not Found", 404));
  }

  //Get reset password Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //req.protocol}://${req.get("host")
  ///api/user
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your Password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then ,Please ignore it...`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce  Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

//for Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  //Hashing and adding resetPasswordToken
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password Does't Match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  //for login
  sendToken(user, 200, res);
});

//get User Details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  // console.log('enter');
  const user = await User.findById(req.user.id);
  res.status(200).send({
    status: true,
    user,
  });
});

//Update User Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHander("Old Password is inCorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not matched", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

//Update User Profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "undefined" && req.body.avatar !== "") {
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;

    await cloudnary.v2.uploader.destroy(imageId);

    const myCloud = await cloudnary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: "150",
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).send({
    success: true,
  });
});

//get All User Details
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).send({
    success: true,
    users,
  });
});

//get Single User Details (ADMIN)
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User Does not exist with id ${req.params.id}`, 400)
    );
  }

  res.status(200).send({
    success: true,
    user,
  });
});

//Update User Profile (ADMIN)
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  //we will do avatar later with cloudnary

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).send({
    success: true,
  });
});

//Delete User Profile (ADMIN)
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  //we will delete avatar later with cloudnary

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with id ${req.params.id}`, 400)
    );
  }

  await user.deleteOne();

  res.status(200).send({
    success: true,
    message: "User Deleted Successfully",
  });
});
