const order = require("../models/orderModel");
const product = require("../models/productModel");
const ErrorHander = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");

//Create New Order
exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const Order = await order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).send({
    success: true,
    Order,
  });
});

//Get Single Order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const Order = await order
    .findById(req.params.id)
    .populate("user", "name email");

  if (!Order) {
    return next(
      new ErrorHander(`No order Found for id ${req.query.orderId}`, 400)
    );
  }

  res.status(200).send({
    success: true,
    Order,
  });
});

//Find Logged in Orderds
exports.myOrders = catchAsyncError(async (req, res, next) => {
  const Orders = await order.find({ user: req.user._id });

  res.status(200).send({
    success: true,
    Orders,
  });
});
//Get All Order ADMIN
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const Orders = await order.find();

  let totalAmount = 0;

  Orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).send({
    success: true,
    totalAmount,
    Orders,
  });
});

//Update Order Status  ADMIN
exports.updateOrdersStatus = catchAsyncError(async (req, res, next) => {
  const Order = await order.findById(req.params.id);

  if (!Order) {
    return next(
      new ErrorHander(`No order Found for id ${req.query.orderId}`, 400)
    );
  }
  if (Order.orderStatus === "Delivered") {
    return next(new ErrorHander("This Order is already delivered", 404));
  }

  Order.orderItems.forEach(async (ord) => {
    await updateProduct(ord.product, ord.quantity);
  });

  Order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await Order.save({ validateBeforeSave: false });

  res.status(200).send({
    success: true,
    Order,
  });
});

async function updateProduct(id, quantity) {
  const Product = await product.findById(id);

  Product.stock -= quantity;

  await Product.save({ validateBeforeSave: false });
}

//delete Order ADMIN
exports.deletOrder = catchAsyncError(async (req, res, next) => {
  const Order = await order.findById(req.params.id);
  if (!Order) {
    return next(
      new ErrorHander(`No order Found for id ${req.query.orderId}`, 400)
    );
  }

  await Order.deleteOne();

  res.status(200).send({
    success: true,
  });
});
