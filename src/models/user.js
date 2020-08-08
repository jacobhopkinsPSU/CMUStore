const mongoose = require('mongoose');
const validator = require('validator');

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

require('./modelFunctions/userFunctions')(userSchema);

const User = mongoose.model('User', userSchema);

module.exports = User;
