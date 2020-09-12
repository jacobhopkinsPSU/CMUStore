// TODO: Reenable email validator
const mongoose = require('mongoose');
// const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    // Name of user (must be unique)
    name: {
      type: String,
      required: [true, 'Name must be included'],
      trim: true,
      unique: true,
    },
    // Email of user (must be unique)
    email: {
      type: String,
      required: [true, 'Email must be included'],
      trim: true,
      unique: true,
      // Make sure that email is real and has a school domain
      // validate(value) {
      //   if (!validator.isEmail(value) || !value.match(/@s\.blackhawksd\.org/)) {
      //     throw new Error('Email is invalid');
      //   }
      // },
    },
    // User password (will hash when saved)
    password: {
      type: String,
      required: [true, 'Password must be included'],
      minlength: [5, 'Password must be 5 characters or longer'],
    },

    // Grade level
    grade: {
      type: Number,
      required: [true, 'Grade number must be included'],
      // Fancy regex to limit grades
      validate: [/^([9]|1[012])$/, 'Grade must be between 9 and 12'],
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

require('../methods/user')(userSchema);

const User = mongoose.model('User', userSchema);

module.exports = User;
