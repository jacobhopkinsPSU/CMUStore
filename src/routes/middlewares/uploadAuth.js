const Item = require('../../models/item');
const { ErrorHandler } = require('../../utils/error');

const userAuth = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      throw new ErrorHandler(404, 'No item exists with that ID');
    }

    req.item = item;

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = userAuth;
