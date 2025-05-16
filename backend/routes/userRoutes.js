const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  updateUserProfile
} = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const userRole = require("../utils/enums/userRole");

router
  .route("/")
  .get(verifyToken, checkRole([userRole.ADMIN]), getAllUsers)
  .post(verifyToken, checkRole([userRole.ADMIN]), createUser);

router
  .route("/:id")
  .get(verifyToken, checkRole([userRole.ADMIN]), getUserById)
  .delete(verifyToken, checkRole([userRole.ADMIN]), deleteUser);

router
  .route("/:userId/role")
  .patch(verifyToken, checkRole([userRole.ADMIN]), updateUser);

  router
  .route("/profile")
  .patch(verifyToken, checkRole([userRole.ADMIN, userRole.USER]), updateUserProfile);

module.exports = router;
