const express = require("express");
const router = express.Router();
const controller = require("../controllers/userControllers");
const {
  isAuthenticatedUser,
  authorizeRole,
} = require("../middleware/authenticateJwt");

router.route("/register").post(controller.registerUser);
router.route("/login").post(controller.loginUser);
router.route("/password/forgot").post(controller.forgetPassword);
router.route("/password/reset/:token").put(controller.resetPassword);
// router.route("/forget").get(controller.forgetUser);

router.route("/logout").get(controller.logoutUser);
router.route("/me").get(isAuthenticatedUser, controller.getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, controller.updatePassword);
router.route("/me/update").put(isAuthenticatedUser, controller.updateProfile);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRole("admin"), controller.getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), controller.getSingleUser)
  .put(isAuthenticatedUser, authorizeRole("admin"), controller.updateUserRole)
  .delete(isAuthenticatedUser, authorizeRole("admin"), controller.deleteUser);

module.exports = router;
