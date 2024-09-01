import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js";
import MyErrorClass from "../utils/error.js";

const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return next(new MyErrorClass("Please First Login", 401));
    }

    const decode = jwt.decode(token);

    const user = await userModel.findById(decode);

    if (!user) {
      return next(new MyErrorClass("No user found", 401));
    }

    req.user = {
      ...user.toJSON(),
      _id: user._id.toString(),
    };

    next();
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export default isAuthenticated;