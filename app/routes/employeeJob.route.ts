import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();

import employeeJobController from "../controllers/employeeJob.controller";

// 📦 Employee CRUD routes
router.post("/", employeeJobController.assignJobToEmployee);
router.post("/assign-multiple", employeeJobController.assignJobToManyEmployees);

export default router;
