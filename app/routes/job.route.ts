import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();


import jobController from "../controllers/job.controller";

// 📦 Employee CRUD routes
router.post("/", jobController.createJob);
router.get("/", jobController.getAllJobs);






export default router;
