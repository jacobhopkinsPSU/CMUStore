// TODO: None
const mongoose = require('mongoose');

const conn = mongoose.createConnection(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

module.exports = conn;
