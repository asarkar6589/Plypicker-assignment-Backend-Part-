import { Request, Response, NextFunction } from "express";
import MyErrorClass from "../utils/error.js";
import userModel from "../models/user.js";
import { LoginUser, UserRegistration } from "../interfaces/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (
  req: Request<{}, {}, UserRegistration>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return next(
        new MyErrorClass("Please enter all the required fields", 404)
      );
    }

    const user = await userModel.findOne({ email });
    if (user) {
      return next(new MyErrorClass("User already exists", 409));
    }

    const hasshedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      email,
      password: hasshedPassword,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const loginUser = async (
  req: Request<{}, {}, LoginUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new MyErrorClass("Please enter all the required fields", 404)
      );
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return next(new MyErrorClass("No user found", 404));
    }

    const hasshedPassword = await bcrypt.compare(password, user.password);

    if (!hasshedPassword) {
      return next(new MyErrorClass("Invalid Email or password", 401));
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.SECRET_KEY!
    );
    
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 1 * 24 * 60 * 60 * 1000, // 90days
      })
      .json({
        success: true,
        message: `Welcome back ${user.email}`,
      });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res
      .status(200)
      .cookie("token", " ", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(0)
      })
      .json({
        success: true,
        message: `User logged out successfully`,
      });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    return res.status(200).json({
      sucess: true,
      user,
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};
