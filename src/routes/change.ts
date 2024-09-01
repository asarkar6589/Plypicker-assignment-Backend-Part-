import express from "express";
import {
  changeRequest,
  getAllRequestByAdmin,
  getAllRequestByUser,
  getCountOfRequestByUser,
  getCountOfRequestForAdmin,
  getRequestById,
  newRequestForChange,
} from "../controllers/change.js";
import { isAdmin } from "../middleware/isAdmin.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { sinlgeUpload } from "../middleware/multer.js";

const router = express.Router();

router
  .route("/new/:productId")
  .post(isAuthenticated, sinlgeUpload, newRequestForChange);
router.route("/all").get(isAuthenticated, isAdmin, getAllRequestByAdmin);
router.route("/user/all").get(isAuthenticated, getAllRequestByUser);
router.route("/user/count").get(isAuthenticated, getCountOfRequestByUser);
router
  .route("/admin/count")
  .get(isAuthenticated, isAdmin, getCountOfRequestForAdmin);
router.route("/update/:changeId").put(isAuthenticated, isAdmin, changeRequest);
router.route("/:id").get(isAuthenticated, isAdmin, getRequestById);

export default router;
