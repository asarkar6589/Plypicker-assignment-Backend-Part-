import mongoose, { Document } from "mongoose";

interface Change extends Document {
  user: mongoose.Schema.Types.ObjectId;
  product: mongoose.Schema.Types.ObjectId;
  status: "Pending" | "Approved" | "Rejected";
  changes: {
    name?: string;
    description?: string;
    photo?: string;
    price?: number;
  };
}

const changeSchema = new mongoose.Schema<Change>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  changes: {
    name: {
      type: String,
    },
    price: {
      type: String,
    },
    description: {
      type: String,
    },
    photo: {
      type: String,
    },
  },
});

const changeModel = mongoose.model<Change>("Change", changeSchema);

export default changeModel;
