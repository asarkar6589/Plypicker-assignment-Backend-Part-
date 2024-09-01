import mongoose, { Document, models } from "mongoose";

export interface User extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
  password: string;
  role: "Admin" | "User";
}

const userSchema = new mongoose.Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin", "User"],
    required: true,
    default: "User",
  },
});

const userModel = mongoose.model<User>("User", userSchema);

export default userModel;
