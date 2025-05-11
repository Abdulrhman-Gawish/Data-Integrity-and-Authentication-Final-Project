const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { Schema } = mongoose;
const UserRoles = require("../utils/enums/userRole");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isLength(value, { min: 2, max: 50 });
        },
        message: "Name must be between 2 and 50 characters",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
      },
      select: false, 
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRoles),
        message: "{VALUE} is not a valid role",
      },
      default: UserRoles.USER,
    },
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
    twoFASecret: {
      type: String,
      select: true, 
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password; 
        delete ret.twoFASecret;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); 
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;