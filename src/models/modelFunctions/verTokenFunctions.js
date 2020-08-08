const crypto = require('crypto');

module.exports = function verTokenFunctions(verTokenSchema) {
  const schema = verTokenSchema;

  schema.statics.generateVerToken = async function genVer(id) {
    const VerToken = this;
    const tokenValue = crypto.randomBytes(48).toString('hex');
    const duplicateToken = await VerToken.findOne({ value: tokenValue });

    if (!duplicateToken) {
      const token = new VerToken({
        owner: id,
        value: tokenValue,
      });
      await token.save();
    } else {
      VerToken.generateVerToken();
    }
  };
};
