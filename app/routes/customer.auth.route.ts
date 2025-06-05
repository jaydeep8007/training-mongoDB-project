import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();

import customerAuthController from "../controllers/customerAuth.controller";

// 🔐 Auth routes
router.post("/login", customerAuthController.signinCustomer);
router.post("/signup", customerAuthController.signupCustomer); // Optional
router.post("/forget-password", customerAuthController.forgotPassword);
router.post("/reset-password", customerAuthController.resetPassword);

export default router;
