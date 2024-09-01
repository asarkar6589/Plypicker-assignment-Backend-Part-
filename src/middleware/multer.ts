import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg" && ext !== ".gif") {
    return cb(new Error("Only images are allowed"), false);
  }
  cb(null, true);
};

export const sinlgeUpload = multer({
  storage,
  fileFilter
}).single("photo");

// multer().single("file") -> This is a middlware, we can use it in app.ts Now we can access it using req.file.photo
