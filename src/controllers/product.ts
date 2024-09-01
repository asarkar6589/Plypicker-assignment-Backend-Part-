import { NextFunction, Request, Response } from "express";
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { NewProduct, UpdateProduct } from "../interfaces/product.js";
import productModel from "../models/product.js";
import giveCurrentDateTime from "../utils/config.js";
import MyErrorClass from "../utils/error.js";
import config from "../utils/firebase.js";

initializeApp(config.firebaseConfig);

export const storage = getStorage();

export const addNewProduct = async (
  req: Request<{}, {}, NewProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
      return next(new MyErrorClass("Please give all the details", 404));
    }

    const file = req.file;

    if (!file) {
      return next(new MyErrorClass("Please upload a photo", 404));
    }

    const currentDate = giveCurrentDateTime();

    // we are adding the current date with the file name because if we add 2 same pictures, then firebase will replace this file.
    const storageRef = ref(
      storage,
      `files/${file.originalname + "     " + currentDate}`
    );

    const metadata = {
      contentType: file.mimetype,
    };

    // upload file
    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata
    );

    // grab the public url
    const downloadURL = await getDownloadURL(snapshot.ref);

    await productModel.create({
      name,
      description,
      price,
      image: downloadURL,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

interface Params {
  id: string;
}
export const updateProductByAdmin = async (
  req: Request<Params, {}, UpdateProduct>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new MyErrorClass("Please provide the id of the user", 404));
    }

    const product = await productModel.findById(id);

    if (!product) {
      return next(new MyErrorClass("No product found", 404));
    }

    let { name, description, price } = req.body;
    const file = req.file;

    if (name) {
      product.name = name;
    }

    if (description) {
      product.description = description;
    }

    if (price) {
      price = Number(price);
      product.price = price;
    }

    if (file) {
      const currentDate = giveCurrentDateTime();

      // we are adding the current date with the file name because if we add 2 same pictures, then firebase will replace this file.
      const storageRef = ref(
        storage,
        `files/${file.originalname + "     " + currentDate}`
      );

      const metadata = {
        contentType: file.mimetype,
      };

      // upload file
      const snapshot = await uploadBytesResumable(
        storageRef,
        file.buffer,
        metadata
      );

      // grab the public url
      const downloadURL = await getDownloadURL(snapshot.ref);

      product.image = downloadURL;
    }

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await productModel.find({});
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const getProductById = async (
  req: Request<Params>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new MyErrorClass("Please provide a id", 400));
    }

    const product = await productModel.findById(id);

    if (!product) {
      return next(new MyErrorClass("No product found", 404));
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};
