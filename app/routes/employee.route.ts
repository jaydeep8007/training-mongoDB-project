import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();

import employeeController from "../controllers/employee.controller";

// 📦 Employee CRUD routes
router.post("/", employeeController.createEmployee);
router.get("/", employeeController.getAllEmployees);
// router.get("/:id", employeeController.getEmployeeById);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

export default router;
