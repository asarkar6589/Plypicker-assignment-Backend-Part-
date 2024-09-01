import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { addNewProduct, getAllProducts, getProductById, updateProductByAdmin } from '../controllers/product.js';
import { sinlgeUpload } from '../middleware/multer.js';


const router = express.Router();

router.route('/new').post(isAuthenticated, isAdmin, sinlgeUpload, addNewProduct);
router.route('/update/:id').put(isAuthenticated, isAdmin, sinlgeUpload, updateProductByAdmin);
router.route('/all').get(getAllProducts);
router.route('/get/:id').get(isAuthenticated, getProductById);

export default router;
