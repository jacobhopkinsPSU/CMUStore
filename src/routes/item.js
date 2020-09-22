// TODO: Display items with pagination. Maybe search functionality.
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');

const conn = require('../mongoose/index');
const userAuth = require('./middlewares/userAuth');
const uploadAuth = require('./middlewares/uploadAuth');
const Item = require('../models/item');
const { ErrorHandler } = require('../utils/error');
const errorMiddleware = require('./middlewares/errorMiddleware');

const router = new express.Router();

let gfs;

conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'imageUpload',
  });
});

const storage = new GridFsStorage({
  db: conn,
  file: (req, file) => {
    // Generate random name with crypto and maintain extension
    const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);

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

router.get('/items/image', (req, res) => {
  gfs.find().toArray((err, files) => {
    console.log(files);
  });
});

router.use(errorMiddleware);

module.exports = router;
