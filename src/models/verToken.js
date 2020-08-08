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
    expires: 3600,
  },
});

require('./modelFunctions/verTokenFunctions')(verTokenSchema);

const VerToken = mongoose.model('Tokens', verTokenSchema);

module.exports = VerToken;
