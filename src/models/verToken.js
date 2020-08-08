const mongoose = require('mongoose');
const crypto = require('crypto');

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
    expires: 60,
  },
});

verTokenSchema.statics.generateVerToken = async function genVer(id) {
  const tokenValue = crypto.randomBytes(48).toString('hex');
  const token = new VerToken({
    owner: id,
    value: tokenValue,
  });

  await token.save();
};

const VerToken = mongoose.model('Tokens', verTokenSchema);

module.exports = VerToken;
