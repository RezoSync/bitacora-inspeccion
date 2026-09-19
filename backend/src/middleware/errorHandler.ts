import { ErrorRequestHandler, RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({ message: 'Route not found' });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  response.status(error.statusCode ?? 500).json({
    message: error.message ?? 'Internal server error',
  });
};
