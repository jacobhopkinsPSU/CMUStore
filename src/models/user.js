const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    // Name of user
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Email of user
    email: {
      type: String,
      required: true,
      trim: true,
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
    grade: {
      type: Number,
      required: true,
      validate: /^([9]|1[012])$/,
    },
    role: {
      type: String,
      default: 'unverified',
      enum: ['unverified', 'verified', 'admin'],
    },
    token: {
      type: String,
    },
  },
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

const User = mongoose.model('User', userSchema);

module.exports = User;
