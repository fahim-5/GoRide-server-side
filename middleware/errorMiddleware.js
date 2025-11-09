import { HTTP_STATUS } from '../utils/constants.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === HTTP_STATUS.OK ? HTTP_STATUS.INTERNAL_SERVER_ERROR : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = 'Resource not found';
  }

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};