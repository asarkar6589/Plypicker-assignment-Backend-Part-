import express from "express";
import { getUserById, loginUser, logoutUser, registerUser } from "../controllers/user.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.route('/new').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);
router.route('/profile').get(isAuthenticated, getUserById);

export default router;
