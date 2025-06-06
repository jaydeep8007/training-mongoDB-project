import express from "express";
const router = express.Router();

import customerRoutes from "./customer.route";
import empoyeeRoutes from "./employee.route";
import jobRoutes from "./job.route";
import employeeJobRoutes from "./employeeJob.route";

router.use("/customer", customerRoutes);
router.use("/employee", empoyeeRoutes);
router.use("/job", jobRoutes);
router.use("/employee-job", employeeJobRoutes);

export default router;
