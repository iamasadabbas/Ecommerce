const express = require("express");
const controller = require("../controllers/productControllers"); //Must Import Controller to access its functions
const {
  isAuthenticatedUser,
  authorizeRole,
} = require("../middleware/authenticateJwt");

const router = express.Router();

//===========================================//
//====  IMPORT CONTROLLER MODULES   ========//
//=========================================//
router.route("/get").get(controller.getAllProducts);
router
  .route("/admin/product/new")
  .post(
    isAuthenticatedUser,
    authorizeRole("admin"),
    controller.createNewProduct
  );
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRole("admin"), controller.updateProduct);
router
  .route("/admin/product/:id")
  .delete(
    isAuthenticatedUser,
    authorizeRole("admin"),
    controller.deleteProduct
  );
router.route("/getProductDetail/:id").get(controller.getProductDetail);

router
  .route("/review")
  .put(isAuthenticatedUser, controller.createProductReview);

router
  .route("/reviews")
  .get(controller.getProductsReview)
  .delete(isAuthenticatedUser, controller.deletReview);

module.exports = router;
