import { NextFunction, Request, Response } from "express";
import { NewChangeRequest, Params } from "../interfaces/change.js";
import MyErrorClass from "../utils/error.js";
import productModel from "../models/product.js";
import giveCurrentDateTime from "../utils/config.js";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./product.js";
import changeModel from "../models/change.js";

interface ObjectType {
  name?: string;
  price?: number;
  description?: string;
  photo?: string;
}
export const newRequestForChange = async (
  req: Request<Params, {}, NewChangeRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    if (!productId) {
      return next(new MyErrorClass("No productId provided", 404));
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return next(new MyErrorClass("No product found", 404));
    }

    let { name, description, price } = req.body;
    const photo = req.file;

    if (!name && !description && !photo && !price) {
      return next(new MyErrorClass("You have not entered any value", 404));
    }

    let obj: ObjectType = {};

    if (name) {
      if (product.name === name) {
        return next(
          new MyErrorClass("The given name is equal to the stored value", 404)
        );
      }

      obj.name = name;
    }

    if (photo) {
      const currentDate = giveCurrentDateTime();

      // we are adding the current date with the file name because if we add 2 same pictures, then firebase will replace this file.
      const storageRef = ref(
        storage,
        `files/${photo.originalname + "     " + currentDate}`
      );

      const metadata = {
        contentType: photo.mimetype,
      };

      // upload file
      const snapshot = await uploadBytesResumable(
        storageRef,
        photo.buffer,
        metadata
      );

      // grab the public url
      const downloadURL = await getDownloadURL(snapshot.ref);

      obj.photo = downloadURL;
    }

    if (description) {
      if (product.description === description) {
        return next(
          new MyErrorClass(
            "The given description is same as the stored value",
            404
          )
        );
      }

      obj.description = description;
    }

    if (price) {
      price = Number(price);
      if (product.price === price) {
        return next(
          new MyErrorClass("The given price is equal to the stored value", 404)
        );
      }

      obj.price = price;
    }

    await changeModel.create({
      user,
      product,
      changes: obj,
    });

    return res.status(201).json({
      success: true,
      message:
        "Your request is submitted. You can track it from your profile section",
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const getAllRequestByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = await changeModel.find({
      status: "Pending",
    });
    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const getAllRequestByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user?._id;

    const requests = await changeModel.find({
      user: id,
    });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const getCountOfRequestByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user?._id;
    // total requests count
    const requests = await changeModel.find({
      user: id,
    });

    // approved requests
    const countOfApprovedRequests = await changeModel.find({
      user: id,
      status: "Approved",
    });

    // rejected requests
    const countOfrejectedRequests = await changeModel.find({
      user: id,
      status: "Rejected",
    });

    // pending requests
    const countOfPendingRequests = await changeModel.find({
      user: id,
      status: "Pending",
    });
    return res.status(200).json({
      success: true,
      totalRequest: requests.length,
      approvedRequest: countOfApprovedRequests.length,
      rejectedRequest: countOfrejectedRequests.length,
      pendingRequest: countOfPendingRequests.length,
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const getCountOfRequestForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // total request
    const totalRequest = await changeModel.find({});

    // approved by admin
    const approvedRequest = await changeModel.find({
      status: "Approved",
    });

    // rejected by admin
    const rejectedRequest = await changeModel.find({
      status: "Rejected",
    });

    // still pending
    const pendingRequest = await changeModel.find({
      status: "Pending",
    });

    return res.status(200).json({
      success: true,
      totalRequest: totalRequest.length,
      approvedRequest: approvedRequest.length,
      rejectedRequest: rejectedRequest.length,
      pendingRequest: pendingRequest.length,
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const changeRequest = async (
  req: Request<{ changeId: string }, {}, { status: "Approved" | "Rejected" }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { changeId } = req.params;
    const user = req.user;

    if (!changeId) {
      return next(new MyErrorClass("No id provided", 404));
    }

    const request = await changeModel.findById(changeId);

    if (!request) {
      return next(new MyErrorClass("No request found", 404));
    }

    if (request.status === "Approved" || request.status === "Rejected") {
      return next(new MyErrorClass("Status is already updated", 400));
    }

    const productId = request.product;
    const product = await productModel.findById(productId);
    if (!product) {
      return next(new MyErrorClass("Product not found", 404));
    }

    const { status } = req.body;

    if (status === "Rejected") {
      request.status = status;
      await request.save();

      return res.status(200).json({
        success: true,
        message: "Request Rejected Successfully.",
      });
    } else {
      // status is accepted
      request.status = status;
      const changes = request.changes;
      const { name, price, description, photo } = changes;

      if (name) {
        product.name = name;
      }

      if (price) {
        product.price = price;
      }

      if (photo) {
        product.image = photo;
      }

      if (description) {
        product.description = description;
      }

      await request.save();
      await product.save();

      return res.status(200).json({
        success: true,
        message: "Request Accepted Successfully.",
      });
    }
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 500));
  }
};

export const getRequestById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const request = await changeModel.findById(id);

    if (!request) {
      return next(new MyErrorClass("No request found", 400));
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error: any) {
    return next(new MyErrorClass(error.message, 400));
  }
};

export const getRequestsByUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {};
