const express = require('express');
const auth = require('../middlewares/userAuth');
const Item = require('../../models/item');

const router = new express.Router();

// Create an item
router.post('/items', auth, async (req, res) => {
  try {
    if (!req.user.role === 'admin') {
      throw new Error('User must be an admin!');
    }

    const item = new Item(req.body);
    await item.save();

    res.status(201).send('Item created successfully');
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
