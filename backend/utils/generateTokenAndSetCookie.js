const jwt = require("jsonwebtoken");
const generateAuthToken = (payload, res) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30m" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: 30 * 60 * 1000, // 10 minutes in milliseconds
  });
  return token;
};

module.exports = generateAuthToken;
