const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unaithorization - no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unaithorization - invalid token" });
    }
    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    next();
  } catch (error) {
    console.error("Error in verify token ", error);
    return res.status(500).json({ success: false, message: "Server Error " });
  }
};

module.exports = verifyToken;
