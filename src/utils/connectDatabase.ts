import mongoose from "mongoose";

const connectDb = ({ url }: { url: string }) => {
  mongoose
    .connect(url, {
      dbName: "test",
    })
    .then(() => {
      console.log("Database connected");
    })
    .catch((e) => {
      console.log(e);
    });
};

export default connectDb;
