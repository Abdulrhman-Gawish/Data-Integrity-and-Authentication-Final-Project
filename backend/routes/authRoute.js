const express = require("express");
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);
router.route("/checkAuth").get(verifyToken, authController.checkAuth);
router.route("/enable2FA").post(authController.enable2FA);
router.route("/verify2FA").post(authController.verify2FA);

module.exports = router;
