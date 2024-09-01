import mongoose from "mongoose";

export interface Params {
  productId: string;
}
export interface NewChangeRequest {
  name?: string;
  description?: string;
  price?: number;
}
