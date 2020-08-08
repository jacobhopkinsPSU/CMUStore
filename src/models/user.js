const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const roleDef = require('../config/roleConfig');

const userSchema = new mongoose.Schema(
  {
    // Name of user (must be unique)
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // Email of user (must be unique)
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      // Make sure that email is real and has a school domain
      validate(value) {
        if (!validator.isEmail(value) || !value.match(/@s\.blackhawksd\.org/)) {
          throw new Error('Email is invalid');
        }
      },
    },
    // User password (will hash when saved)
    password: {
      type: String,
      required: true,
      minlength: 5,
    },

    // Grade level
    grade: {
      type: Number,
      required: true,
      // Fancy regex to limit grades
      validate: /^([9]|1[012])$/,
    },

    // User roles (forced to unverified at creation)
    role: {
      type: String,
      enum: ['unverified', 'verified', 'admin'],
    },

    // User email verification token
    verToken: {
      type: String,
    },

    // JWT Tokens
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  // Add timestamps for future functionality
  {
    timestamps: true,
  },
);

// Hash user password before it is saved
userSchema.pre('save', async function hashPass(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Check to see if a user can perform an operation
userSchema.methods.can = function userCan(operation) {
  const user = this;

  if (!roleDef[user.role]) {
    throw new Error('Role does not exist!');
  }

  if (roleDef[user.role].can.includes(operation)) {
    return true;
  }

  return false;
};

// Get rid of sensitive info when sending back user info
userSchema.methods.toJSON = function JSONSettings() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Generate JWTs
userSchema.methods.generateAuthToken = async function genAuth() {
  const user = this;

  /* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Generate user verification token
userSchema.methods.generateVerToken = async function genVer() {
  const user = this;

  const token = crypto.randomBytes(48).toString('base64').replace('/', '-');

  user.verToken = token;

  await user.save();
};

// Find a user by email then verify that the passwords match
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
