// TODO: Display items with pagination. Maybe search functionality.
const express = require('express');
const multer = require('multer');

const userAuth = require('./middlewares/userAuth');
const itemAuth = require('./middlewares/itemAuth');
const Item = require('../models/item');
const { ErrorHandler } = require('../utils/error');
const errorMiddleware = require('./middlewares/errorMiddleware');

const router = new express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create an item
router.post('/items', userAuth, async (req, res, next) => {
  try {
    if (!req.user.can('item:create')) {
      throw new ErrorHandler(403, 'User must be an admin');
    }

    const item = new Item(req.body);
    await item.save();

    // eslint-disable-next-line no-underscore-dangle
    const id = item._id;

    res.status(201).send({ id });
  } catch (e) {
    next(e);
  }
});

router.post(
  '/items/upload/:id',
  userAuth,
  itemAuth,
  upload.any('image'),
  async (req, res, next) => {
    const { files } = req;
    try {
      if (!files) {
        throw new ErrorHandler(400, 'Must upload files');
      }

      files.forEach((file) => {
        req.item.images = req.item.images.concat({ imageName: file.filename });
      });

      await req.item.save();

      res.status(201).send();
    } catch (e) {
      next(e);
    }
  },
);

router.use(errorMiddleware);

module.exports = router;
