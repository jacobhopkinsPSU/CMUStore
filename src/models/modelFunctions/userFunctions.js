const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const roleDef = require('../../config/roleConfig');

module.exports = function userFunction(userSchema) {
  const schema = userSchema;

  // Hash user password before it is saved
  schema.pre('save', async function hashPass(next) {
    const user = this;

    if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8);
    }

    next();
  });

  // Check to see if a user can perform an operation
  schema.methods.can = function userCan(operation) {
    const user = this;

    if (!roleDef[user.role]) {
      throw new Error('Role does not exist!');
    }

    if (roleDef[user.role].can.includes(operation)) {
      return true;
    }

    return false;
  };

  // Get rid of sensitive info when sending back user info
  schema.methods.toJSON = function JSONSettings() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
  };

  // Generate JWTs
  schema.methods.generateAuthToken = async function genAuth() {
    const user = this;

    /* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET,
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
  };

  // Generate user verification token
  schema.methods.generateVerToken = async function genVer() {
    const user = this;

    const token = crypto.randomBytes(48).toString('base64').replace('/', '-');

    user.verToken = token;

    await user.save();
  };

  // Find a user by email then verify that the passwords match
  schema.statics.findByCredentials = async function userFind(email, password) {
    const user = await this.findOne({ email });

    if (!user) {
      throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Unable to login');
    }

    return user;
  };
};
