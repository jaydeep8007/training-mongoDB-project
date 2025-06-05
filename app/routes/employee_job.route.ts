import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();

import employee_JobController from "../controllers/employee_Job.controller";


// 📦 Employee CRUD routes
router.post("/", employee_JobController.assignJobToEmployee);
router.post("/assign-multiple", employee_JobController.assignJobToManyEmployees);


export default router;
