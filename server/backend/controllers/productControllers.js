const product = require("../models/productModel");
const ErrorHander = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

//===========================================//
//====CONTROLLER TO CREATE NEW PRODUCTS=====//
//=========================================//
exports.createNewProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const products = await product.create(req.body);

  res.status(201).json({
    success: true,
    products,
  });
});

//===========================================//
//====CONTROLLER TO GET ALL PRODUCTS   =====//
//=========================================//
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  console.log(req.query);
  // return next(new ErrorHander('error while product',500))

  const resultPerPage = 4;

  const productCount = await product.countDocuments();
  const apiFeature = new ApiFeatures(product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeature.query;
  let filteredProductsCount = products.length;
  apiFeature.pagination(resultPerPage);
  products = await apiFeature.query.clone();
  // for clone help
  // https://masteringjs.io/tutorials/mongoose/query-was-already-executed

  res.status(200).json({
    success: true,
    products,
    productCount,
    resultPerPage,
    filteredProductsCount,
  });
});

//==============================================//
//====CONTROLLER TO GET PRODUCTS DETAIL   =====//
//============================================//
exports.getProductDetail = catchAsyncError(async (req, res, next) => {
  const Product = await product.findById(req.params.id);

  if (!Product) {
    return next(new ErrorHander("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    Product,
  });
});

//=============================================//
//====CONTROLLER TO UPDATE PRODUCT BY ID =====//
//===========================================//
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let products = await product.findById(req.params.id);

  if (!products) {
    return next(new ErrorHander("Product Not Found", 404));
  }

  products = await product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    products,
  });
});

//=============================================//
//====CONTROLLER TO DELETE PRODUCT BY ID =====//
//===========================================//
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  let products = await product.findById(req.params.id);

  if (!products) {
    return next(new ErrorHander("Product Not Found", 404));
  }

  await products.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

//=====================================================//
//====CONTROLLER TO Create/Update Product Review =====//
//===================================================//
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const Product = await product.findById(productId);

  const isReviewed = await Product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    Product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    Product.reviews.push(review);
    Product.noOfReviews = Product.reviews.length;
  }

  console.log(Product);
  let avg = 0;

  Product.reviews.forEach((rev) => {
    avg = avg + rev.rating;
  });

  Product.ratings = avg / Product.reviews.length;

  await Product.save({ validateBeforeSave: false });

  res.status(200).send({
    success: true,
  });
});

//=====================================================//
//====CONTROLLER TO get All Product Review ===========//
//===================================================//
exports.getProductsReview = catchAsyncError(async (req, res, next) => {
  const Product = await product.findById(req.query.id);
  if (!Product) {
    return next(
      new ErrorHander(`No product Found with Id ${req.query.id}`, 400)
    );
  }

  res.status(200).send({
    status: true,
    reviews: Product.reviews,
  });
});

//=====================================================//
//====CONTROLLER TO  Delete Product Review ===========//
//===================================================//
exports.deletReview = catchAsyncError(async (req, res, next) => {
  const Product = await product.findById(req.query.productId);
  if (!Product) {
    return next(
      new ErrorHander(`No product Found with Id ${req.query.id}`, 400)
    );
  }

  const reviews = Product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg = avg + rev.rating;
  });

  const ratings = avg / reviews.length;

  const noOfReviews = reviews.length;

  await product.findByIdAndUpdate(
    req.query.productId,
    {
      ratings,
      reviews,
      noOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).send({
    status: true,
    reviews: Product.reviews,
  });
});
