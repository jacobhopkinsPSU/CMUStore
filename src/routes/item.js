// TODO: None
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const AWS = require('aws-sdk');

const userAuth = require('./middlewares/userAuth');
const itemAuth = require('./middlewares/itemAuth');
const Item = require('../models/item');
const { ErrorHandler } = require('../utils/error');
const errorMiddleware = require('./middlewares/errorMiddleware');

const router = new express.Router();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});
const S3 = new AWS.S3();

// Configure Multer
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

// Upload an image to S3 bucket
router.post(
  '/items/images/:id',
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
        // Create image name
        const imageName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);

        // Resize image and convert to png
        const buffer = sharp(file.buffer).resize({ width: 512, height: 512 }).png().toBuffer();

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: imageName,
          Body: buffer,
        };

        S3.upload(params, (err) => {
          if (err) {
            throw new ErrorHandler(500, 'Unable to connect to AWS');
          }
        });

        req.item.images = req.item.images.concat({ imageName });
      });

      await req.item.save();

      res.status(201).send();
    } catch (e) {
      next(e);
    }
  },
);

// Get list of items in paginated form
router.get('/items/group', userAuth, async (req, res, next) => {
  const { page = 1, limit = 8 } = req.query;

  if (!req.user.can('item:view')) {
    throw new ErrorHandler(401, 'User does not have permission');
  }

  try {
    const items = await Item.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Item.countDocuments();

    res.send({
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/items/search', userAuth, async (req, res, next) => {
  const { search = '', page = 1, limit = 8 } = req.query;

  if (!req.user.can('item:view')) {
    throw new ErrorHandler(401, 'User does not have permissions');
  }

  try {
    const items = await Item.find({ name: new RegExp(`${search}`) })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Item.countDocuments();

    res.send({
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (e) {
    next(e);
  }
});

// Change values of item if user can be verified as an admin
router.patch('/items/:id', userAuth, itemAuth, async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'description', 'category'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  try {
    if (!isValidOperation) {
      throw new ErrorHandler(400, 'Update fields are invalid');
    }

    if (!req.user.can('item:modify')) {
      throw new ErrorHandler(403, 'User must be an admin');
    }

    updates.forEach((update) => {
      req.item[update] = req.body[update];
    });
    await req.item.save();
    res.send();
  } catch (e) {
    next(e);
  }
});

// Delete item if a user can be verified as an admin
router.delete('/items/:id', userAuth, itemAuth, async (req, res, next) => {
  try {
    if (req.user.can('item:modify')) {
      await req.item.remove();
    } else {
      throw new ErrorHandler(403, 'User must be an admin');
    }
    res.send();
  } catch (e) {
    next(e);
  }
});

router.use(errorMiddleware);

module.exports = router;
