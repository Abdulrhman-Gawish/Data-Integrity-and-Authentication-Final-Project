const User = require("../models/user");
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");
const generateTokenAndSetCookie = require("../utils/generateTokenAndSetCookie");
const AppError = require("../utils/appError");

/**
 * @desc    Sign up a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signUp = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return next(new AppError("All fields are required", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already in use", 400));
    }

    const secret = speakeasy.generateSecret({ name: email });

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      twoFASecret: secret.base32,
    });

    newUser.password = undefined;
    newUser.twoFASecret = undefined;

    const payload = { userId: newUser._id, userRole: newUser.role };
    const token = generateTokenAndSetCookie(payload, res);

    res.status(201).json({
      success: true,
      message: "User signed up successfully",
      data: { user: newUser, token },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return next(new AppError(`Invalid input data: ${errors.join(". ")}`, 400));
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password +is2FAEnabled +twoFASecret");
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    const payload = { userId: user._id, userRole: user.role };
    const token = generateTokenAndSetCookie(payload, res);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user by clearing token cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "User logged out, cookie cleared",
  });
};

/**
 * @desc    Check authentication status and get current user data
 * @route   GET /api/auth/check
 * @access  Private
 */
const checkAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return next(new AppError("User not found", 400));
    }

    res.status(200).json({
      success: true,
      message: "Authenticated user retrieved",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Enable 2FA for user account
 * @route   POST /api/auth/enable-2fa
 * @access  Private
 */
const enable2FA = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return next(new AppError("User ID is required", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.is2FAEnabled) {
      return next(new AppError("2FA is already enabled", 400));
    }

    let secret = user.twoFASecret;
    if (!secret) {
      const newSecret = speakeasy.generateSecret({ name: `mgmt-task:${user.name || user.email}` });
      secret = newSecret.base32;
      user.twoFASecret = secret;
      await user.save();
    }

    const otpauth_url = speakeasy.otpauthURL({
      secret,
      label: user.name || user.email,
      issuer: "mgmt-task",
      encoding: "base32",
    });

    const qrCodeData = await QRCode.toDataURL(otpauth_url);

    res.status(200).json({
      success: true,
      message: "Scan the QR code to enable 2FA",
      data: {
        qr_code: qrCodeData,
        secret,
        otpauth_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify 2FA token and complete 2FA setup
 * @route   POST /api/auth/verify-2fa
 * @access  Private
 */
const verify2FA = async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return next(new AppError("User ID and token are required", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
      window: 2,
    });

    console.log(user.twoFASecret);
    console.log(verified);

    if (!verified) {
      return next(new AppError("2FA authentication failed", 401));
    }

    user.is2FAEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "2FA authentication successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUp,
  login,
  logout,
  checkAuth,
  enable2FA,
  verify2FA,
};
