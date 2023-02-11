// const { CustomAPIError } = require('../errors')
const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong!",
  };

  /*   if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message })
  } */

  // Duplication error code issued by Mongoose
  if (err.code && err.code == 11000) {
    customError.msg = `${Object.values(err.keyValue)} is already registered!`;
    customError.statusCode = 400;
  }

  if (err.name == "ValidatorError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name == "CastError") {
    customError.msg = `No item found with ID: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
