const express = require("express");
const controller = require("../controllers/orderControllers"); //Must Import Controller to access its functions
const {
  isAuthenticatedUser,
  authorizeRole,
} = require("../middleware/authenticateJwt");

const router = express.Router();

//===========================================//
//====  IMPORT CONTROLLER MODULES   ========//
//=========================================//
router.route("/order/new").post(isAuthenticatedUser, controller.newOrder);
router.route("/orders/:id").get(isAuthenticatedUser, controller.getSingleOrder);
router.route("/order/me").get(isAuthenticatedUser, controller.myOrders);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRole("admin"), controller.getAllOrders);
router
  .route("/admin/order/:id")
  .put(
    isAuthenticatedUser,
    authorizeRole("admin"),
    controller.updateOrdersStatus
  )
  .delete(isAuthenticatedUser, authorizeRole("admin"), controller.deletOrder);

module.exports = router;
