// TODO: None
/* eslint-disable no-underscore-dangle */
const express = require('express');

const createVerEmail = require('../utils/emails/verEmail');
const User = require('../models/user');
const VerToken = require('../models/verToken');
const userAuth = require('./middlewares/userAuth');
const { ErrorHandler } = require('../utils/error');
const errorMiddleware = require('./middlewares/errorMiddleware');

const router = new express.Router();

// Create a user
router.post('/users', async (req, res, next) => {
  try {
    const user = new User(req.body);

    // Make user role unverified by default
    user.role = 'unverified';

    // Try to save the user and add email verification token
    await user.save();
    const token = await user.generateAuthToken();
    await VerToken.generateVerToken(user._id);
    res.status(201).send({ token });
  } catch (err) {
    next(err);
  }
});

// Login user and create a new JWT
router.post('/users/login', async (req, res, next) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);

    if (!user.can('user:login')) {
      throw new ErrorHandler(401, 'User does not have permission');
    }

    const token = await user.generateAuthToken();
    res.send({ token });
  } catch (err) {
    next(err);
  }
});

// Logout the user and get rid of the current JWT
router.post('/users/logout', userAuth, async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();

    res.send();
  } catch (err) {
    next(err);
  }
});

router.get('/users/logoutall', userAuth, async (req, res, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (err) {
    next(err);
  }
});

// Generate a new verification token and send it by email
router.post('/users/verify/generate', async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findByEmail(email);

    // Find old tokens and delete them and then create a new one
    await VerToken.findOld(user._id);
    const token = await VerToken.generateVerToken(user._id);

    createVerEmail(user.email, user.name, token.value);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/', userAuth, async (req, res, next) => {
  try {
    await req.user.remove();
    res.send();
  } catch (e) {
    next(e);
  }
});

// Verify the user when they click on the link
router.get('/users/verify/:verToken', async (req, res, next) => {
  const { verToken } = req.params;
  try {
    const token = await VerToken.findOne({ value: verToken });

    if (!token) {
      res.render('expired');
    } else {
      const user = await User.findOne({ _id: token.owner });

      user.role = 'verified';
      await user.save();

      res.render('verified', { user: user.name });
    }
  } catch (err) {
    next(err);
  }
});

router.use(errorMiddleware);

module.exports = router;
