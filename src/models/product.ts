import mongoose, { Document } from "mongoose";

interface Product extends Document{
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    image: string;
}

const productSchema = new mongoose.Schema<Product>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

const productModel = mongoose.model<Product>('Product', productSchema);

export default productModel;
