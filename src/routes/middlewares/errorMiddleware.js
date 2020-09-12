// TODO: None
const { handleError } = require('../../utils/error');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Handle cases for duplicate entries and validation errors
  if (err.message.indexOf('11000') !== -1) {
    const newError = {
      statusCode: 409,
      message: {
        type: 'conflict',
        info: 'Name or email is already in use',
      },
    };
    handleError(newError, res);
  } else if (err.errors) {
    // Create an array of messages and add each validation error to it
    const valErrorArr = [];
    Object.keys(err.errors).forEach((e) => {
      valErrorArr.push({
        type: e,
        info: err.errors[e].properties.message,
      });
    });

    const newError = {
      statusCode: 400,
      message: valErrorArr,
    };

    handleError(newError, res);
  } else {
    handleError(err, res);
  }
};

module.exports = errorHandler;
