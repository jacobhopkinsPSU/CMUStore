// TODO: Display items with pagination. Maybe search functionality.
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

const connection = require('../mongoose/index');
const userAuth = require('./middlewares/userAuth');
const uploadAuth = require('./middlewares/uploadAuth');
const Item = require('../models/item');
const { ErrorHandler } = require('../utils/error');
const errorMiddleware = require('./middlewares/errorMiddleware');

const router = new express.Router();

const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    // Generate random name with crypto and maintain extension
    const random = crypto.randomBytes(16).toString('hex');
    const filename = random + path.extname(file.originalname);

    return {
      filename,
      bucketName: 'imageUpload',
    };
  },
});

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
  uploadAuth,
  upload.any(),
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
