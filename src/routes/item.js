// TODO: Display items with pagination. Maybe search functionality.
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const AWS = require('aws-sdk');

const userAuth = require('./middlewares/userAuth');
const itemAuth = require('./middlewares/itemAuth');
const Item = require('../models/item');
const { ErrorHandler } = require('../utils/error');
const errorMiddleware = require('./middlewares/errorMiddleware');

const router = new express.Router();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});
const S3 = new AWS.S3();

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

      let imageName;

      files.forEach((file) => {
        imageName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        req.item.images = req.item.images.concat({ imageName });

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: imageName,
          Body: file.buffer,
        };

        S3.upload(params, (err) => {
          if (err) {
            throw new ErrorHandler(500, 'Unable to connect to AWS');
          }
        });
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
