const express = require("express");
const router = express.Router();
const { getLogs } = require("../controllers/logController");
const userRole = require("../utils/enums/userRole");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

router.get("/logs", verifyToken, checkRole([userRole.ADMIN]), getLogs);
module.exports = router;
