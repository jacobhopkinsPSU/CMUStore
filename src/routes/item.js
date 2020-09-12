// TODO: add image upload functionality. Display items with pagination. Maybe search functionality.

const express = require('express');
const auth = require('./middlewares/userAuth');
const Item = require('../models/item');
const { ErrorHandler, handleError } = require('../utils/error');

const router = new express.Router();

// Create an item
router.post('/items', auth, async (req, res, next) => {
  try {
    if (!req.user.can('item:create')) {
      throw new ErrorHandler(403, 'User must be an admin');
    }

    const item = new Item(req.body);
    await item.save();

    res.status(201).send();
  } catch (e) {
    next(e);
  }
});

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  handleError(err, res);
});

module.exports = router;
