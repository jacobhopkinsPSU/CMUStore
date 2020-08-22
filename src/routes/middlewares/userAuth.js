const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const { ErrorHandler } = require('../../utils/error');

// Authenticate the user's JWT
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      /* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new ErrorHandler(401, 'User must be authenticated');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
