import { Request, Response, NextFunction } from "express";
import employeeJobModel from "../models/employeeJob.model";
import employeeModel from "../models/employee.model";
import jobModel from "../models/job.model";
import employeeJobValidation from "../validations/employeeJob.validation";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { msg } from "../constants/language/en.constant";
import mongoose from "mongoose";

/* ============================================================================
 * 🔗 Assign Job to a Single Employee
 * ============================================================================
 */
const assignJobToEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Zod validation
    const parsed = await employeeJobValidation.assignJobSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_id, job_id } = parsed.data;

    // ✅ Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(emp_id) ||
      !mongoose.Types.ObjectId.isValid(job_id)
    ) {
      return responseHandler.error(res, "Invalid employee or job ID", resCode.BAD_REQUEST);
    }

    // ✅ Fetch employee & job
    const [employee, job] = await Promise.all([
      employeeModel.findById(emp_id),
      jobModel.findById(job_id),
    ]);

    if (!employee) {
      return responseHandler.error(res, `Employee not found`, resCode.NOT_FOUND);
    }

    if (!job) {
      return responseHandler.error(res, `Job not found`, resCode.NOT_FOUND);
    }

    // ❌ Prevent duplicate assignment
    const alreadyAssigned = await employeeJobModel.findOne({ emp_id, job_id });
    if (alreadyAssigned) {
      return responseHandler.error(
        res,
        `Employee "${employee.emp_name}" is already assigned this job`,
        resCode.BAD_REQUEST
      );
    }

    // ✅ Assign job to employee
    const assignment = await employeeJobModel.create({ emp_id, job_id });

    return responseHandler.success(
      res,
      "Job assigned to employee successfully",
      {
        emp_id,
        emp_name: employee.emp_name,
        job_id,
        job_name: job.job_name,
        assignedAt: assignment.createdAt,
      },
      resCode.CREATED
    );
  } catch (error) {
    return next(error);
  }
};
/* ============================================================================
 * 🔗 Assign Job to Multiple Employees
 * ============================================================================
 */
const assignJobToManyEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Validate with Zod
    const parsed = await employeeJobValidation.assignMultipleJobsSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_ids, job_id } = parsed.data;

    // ✅ Validate all ObjectIds
    const isValidJobId = mongoose.Types.ObjectId.isValid(job_id);
    const areValidEmpIds = emp_ids.every((id: string) => mongoose.Types.ObjectId.isValid(id));

    if (!isValidJobId || !areValidEmpIds) {
      return responseHandler.error(res, "Invalid job or employee ID(s)", resCode.BAD_REQUEST);
    }

    // ✅ Check job exists
    const job = await jobModel.findById(job_id);
    if (!job) {
      return responseHandler.error(res, `Job not found for ID: ${job_id}`, resCode.NOT_FOUND);
    }

    // ✅ Fetch all employees
    const employees = await employeeModel.find({ _id: { $in: emp_ids } });
    const foundEmpIds = employees.map((emp) => emp._id.toString());
    const missingEmpIds = emp_ids.filter((id: string) => !foundEmpIds.includes(id));

    if (missingEmpIds.length > 0) {
      return responseHandler.error(
        res,
        `Employee(s) not found for ID(s): ${missingEmpIds.join(", ")}`,
        resCode.NOT_FOUND
      );
    }

    // ✅ Check for existing assignments
    const existingAssignments = await employeeJobModel.find({
      emp_id: { $in: emp_ids },
      job_id,
    });

    const alreadyAssignedEmpIds = existingAssignments.map((ea) => ea.emp_id.toString());
    if (alreadyAssignedEmpIds.length > 0) {
      const alreadyAssignedEmpNames = employees
        .filter((emp) => alreadyAssignedEmpIds.includes(emp._id.toString()))
        .map((emp) => emp.emp_name)
        .join(", ");

      return responseHandler.error(
        res,
        `These employees are already assigned this job: ${alreadyAssignedEmpNames}`,
        resCode.BAD_REQUEST
      );
    }

    // ✅ Assign the job to each employee
    const assignments = await employeeJobModel.insertMany(
      emp_ids.map((emp_id: string) => ({
        emp_id,
        job_id,
      }))
    );

    const assignedEmpNames = employees.map((emp) => emp.emp_name).join(", ");

    return responseHandler.success(
      res,
      `Job '${job.job_name}' assigned to: ${assignedEmpNames}`,
      assignments,
      resCode.CREATED
    );
  } catch (error) {
    return next(error);
  }
};


export default {
  assignJobToEmployee,
  assignJobToManyEmployees,
};
