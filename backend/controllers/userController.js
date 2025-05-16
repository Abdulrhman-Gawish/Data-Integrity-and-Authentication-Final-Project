const User = require("../models/user");
const AppError = require("../utils/appError");
const Log = require("../models/log");

/**
 * @desc    Create a new user (Admin only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Name, email and password are required", 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("User already exists", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    await Log.create({
      action: "CREATE",
      entity: "User",
      userId: req.user._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      details: {
        createdUser: userData,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "User created successfully",
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments();

    await Log.create({
      action: "READ_ALL",
      entity: "User",
      userId: req.user._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        count: users.length,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    await Log.create({
      action: "READ",
      entity: "User",
      entityId: user._id,
      userId: req.user._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/users/:userId/role
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId || !role) {
      return next(new AppError("User ID and role are required", 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from the returned user data

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    await Log.create({
      action: "UPDATE",
      entity: "User",
      entityId: updatedUser._id,
      userId: req.user._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      details: {
        updatedFields: { role },
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:userId
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    await Log.create({
      action: "DELETE",
      entity: "User",
      entityId: user._id,
      userId: req.user._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      details: {
        deletedUser: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (password) updateFields.password = password;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return next(new AppError("Email already in use", 400));
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    await Log.create({
      action: "UPDATE_PROFILE",
      entity: "User",
      userId: req.user._id,
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      details: {
        updatedFields: Object.keys(updateFields),
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    next(error);
  }
};

module.exports = {
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
  createUser,
  updateUserProfile,
};
