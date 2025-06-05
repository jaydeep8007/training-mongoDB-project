import express from "express";
const router = express.Router();
// const VERIFY = require('../util/userAuth');
import customerRoutes from "./customer.route";
import empoyeeRoutes from "./employee.route";
import jobRoutes from "./job.route"
import employeeJobRoutes from "./employee_job.route"

router.use("/customer", customerRoutes);
router.use("/employee", empoyeeRoutes);
router.use("/job", jobRoutes);
router.use("/employee-job", employeeJobRoutes);

export default router;
