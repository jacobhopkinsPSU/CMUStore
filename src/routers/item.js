const express = require('express');
const auth = require('../middleware/loginAuth');
const Item = require('../models/item');

const router = new express.Router();

router.post('/items', auth, async (req, res) => {
  try {
    if (!req.user.role === 'admin') {
      throw new Error('User must be an admin!');
    }

    const item = new Item(req.body);
    await item.save();

    res.status(201).send('item created successfully');
  } catch (e) {
    res.status(400).send(e);
  }
});
