const express = require("express");
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/checkAuth", verifyToken, authController.checkAuth);
router.post("/enable2FA", verifyToken, authController.enable2FA);
router.post("/verify2FA", verifyToken, authController.verify2FA);

/**
 * @desc    GitHub OAuth Routes
 */
router.get("/github", authController.githubAuth);
router.get("/github/callback", authController.githubCallback);
module.exports = router;
