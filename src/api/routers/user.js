const express = require('express');
const User = require('../../models/user');
const VerToken = require('../../models/verToken');
const auth = require('../middlewares/userAuth');
const { handleError, ErrorHandler } = require('../../utils/error');

const router = new express.Router();

// Route to create a user
router.post('/users', async (req, res, next) => {
  try {
    const user = new User(req.body);

    // Make sure that users can't change user role to admin
    user.role = 'unverified';

    // Try to save the user and add JWT and email verification token

    await user.save();

    const token = await user.generateAuthToken();
    // eslint-disable-next-line no-underscore-dangle
    await VerToken.generateVerToken(user._id);
    res.status(201).send({ user, token });
  } catch (err) {
    next(err);
  }
});

// Login user and create a new JWT
router.post('/users/login', async (req, res, next) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password,
    );

    if (!user.can('user:login')) {
      throw new ErrorHandler(403, 'User does not have permission.');
    }

    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    next(err);
  }
});

// Logout the user and get rid of the current JWT
router.post('/users/logout', auth, async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token,
    );
    await req.user.save();

    res.send();
  } catch (err) {
    next(err);
  }
});

// Get all current user data
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  handleError(err, res);
});

module.exports = router;
