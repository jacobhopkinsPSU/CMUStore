const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/loginAuth');

const router = new express.Router();

// Route to create a user
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  // Make sure that users can't change user role to admin
  user.role = 'unverified';

  try {
    await user.save();

    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', auth, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.user.email,
      req.user.password,
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.tokens,
    );

    await req.user.save();
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

module.exports = router;
