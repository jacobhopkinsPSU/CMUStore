const mongoose = require('mongoose');

const verTokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  expire_at: {
    type: Date,
    default: Date.now,
    expires: 43200,
  },
});

require('../methods/verToken')(verTokenSchema);

const VerToken = mongoose.model('Tokens', verTokenSchema);

module.exports = VerToken;
