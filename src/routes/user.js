/* eslint-disable no-underscore-dangle */
const express = require('express');
const pug = require('pug');
const path = require('path');

const sendMail = require('../utils/mailer');
const User = require('../models/user');
const VerToken = require('../models/verToken');
const auth = require('./middlewares/userAuth');
const { handleError, ErrorHandler } = require('../utils/error');

const router = new express.Router();

// Route to create a user
router.post('/users', async (req, res, next) => {
  try {
    const user = new User(req.body);

    // Make user role unverified by default
    user.role = 'unverified';

    // Try to save the user and add email verification token
    await user.save();
    const token = await user.generateAuthToken();
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
    res.send({ token });
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

// Generate a new verification token
router.post('/users/verify/generate', async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findByEmail(email);
    await VerToken.findOld(user._id);
    const token = await VerToken.generateVerToken(user._id);

    sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: 'User Verification',
      html: pug.renderFile(path.join(__dirname, '../views/email.pug'), {
        user: user.name,
        url: `${process.env.NODEMAILER_URL}/users/verify/${token.value}`,
      }),
    });
  } catch (err) {
    next(err);
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

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  // Handle cases for duplicate entries and validation errors
  if (err.message.indexOf('11000') !== -1) {
    const newError = {
      statusCode: 409,
      message: {
        type: 'conflict',
        info: 'Name or email is already in use',
      },
    };
    handleError(newError, res);
  } else if (err.errors) {
    // Create an array of messages and add each validation error to it
    const valErrorArr = [];
    Object.keys(err.errors).forEach((e) => {
      valErrorArr.push({
        type: e,
        info: err.errors[e].properties.message,
      });
    });

    const newError = {
      statusCode: 400,
      message: valErrorArr,
    };

    handleError(newError, res);
  } else {
    handleError(err, res);
  }
});

module.exports = router;
