import { NextFunction, Request, Response } from "express";

// Custom Error Class
class MyErrorClass extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor); // Captures the stack trace
  }
}

// Error Handling Middleware
export const errorMiddleware = (
  err: MyErrorClass,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values for status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific errors
  if (err.name === "CastError") {
    message = "Invalid ID";
    statusCode = 400;
  }

  if (err.name === "ValidationError") {
    message = "Validation Error";
    statusCode = 400;
  }

  // Send the response
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default MyErrorClass;
