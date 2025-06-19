import express from "express";
import dotenv from "dotenv";
import authMiddleware from "../middlewares/auth.middleware";

// Load environment variables
dotenv.config();

const router = express.Router();

import customerAuthController from "../controllers/customerAuth.controller";

// 🔐 Auth routes
router.post("/login", customerAuthController.signinCustomer);
router.post("/signup", customerAuthController.signupCustomer); // Optional
router.post("/forget-password", customerAuthController.forgotPassword);
router.post("/reset-password", customerAuthController.resetPassword);
router.post("/logout", customerAuthController.logoutCustomer);
router.get("/profile",authMiddleware.authCustomer,  customerAuthController.getCustomerProfile);


export default router;
