import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import changeRouter from "./routes/change.js";
import productRouter from "./routes/product.js";
import userRouter from "./routes/user.js";
import connectDb from "./utils/connectDatabase.js";
import { errorMiddleware } from "./utils/error.js";

dotenv.config({
  path: ".env",
});

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

connectDb({
  url: process.env.MONGO_URL!,
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/change", changeRouter);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Ok",
  });
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Server is working on port ${process.env.PORT}`);
});
