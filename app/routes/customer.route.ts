import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();
import customerController from "../controllers/customer.controller";
import customerAuthRoutes from "./customerAuth.route";

// 📦 Customer CRUD routes
router.post("/", customerController.addCustomer);
router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomerById);

router.use("/auth", customerAuthRoutes);

export default router;
