import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();

import employee_JobController from "../controllers/employeeJob.controller";


// 📦 Employee CRUD routes
router.post("/", employee_JobController.assignJobToEmployee);
router.post("/assign-multiple", employee_JobController.assignJobToManyEmployees);
router.get("/all-mappings", employee_JobController.getAllEmployeeJobMappings);


export default router;
