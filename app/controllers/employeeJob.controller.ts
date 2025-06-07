import { Request, Response, NextFunction } from "express";
import employeeJobModel from "../models/employeeJob.model";
import employeeModel from "../models/employee.model";
import jobModel from "../models/job.model";
import employeeJobValidation from "../validations/employeeJob.validation";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import mongoose from "mongoose";

// ✅ Assign job to single employee
const assignJobToEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = employeeJobValidation.assignJobSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_id, job_id } = parsed.data;

    // Check if job exists
    const jobExists = await jobModel.findById(job_id);
    if (!jobExists) {
      return responseHandler.error(res, "Job not found", resCode.NOT_FOUND);
    }

    // Check if employee exists
    const employeeExists = await employeeModel.findById(emp_id);
    if (!employeeExists) {
      return responseHandler.error(
        res,
        "Employee not found",
        resCode.NOT_FOUND
      );
    }

    // Check if already assigned
    const alreadyAssigned = await employeeJobModel.findOne({ emp_id });
    if (alreadyAssigned) {
      return responseHandler.error(
        res,
        "Employee is already assigned a job",
        resCode.BAD_REQUEST
      );
    }

    const assignment = await employeeJobModel.create({ emp_id, job_id });

    return responseHandler.success(
      res,
      "Job assigned to employee successfully",
      assignment,
      resCode.CREATED
    );
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return responseHandler.error(
        res,
        messages.join(", "),
        resCode.BAD_REQUEST
      );
    }

    return next(error); // fallback for unknown errors
  }
};

const assignJobToManyEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = employeeJobValidation.assignMultipleJobsSchema.safeParse(
      req.body
    );
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_ids, job_id } = parsed.data;

    // ✅ Get job details (including job name)
    const job = await jobModel.findById(job_id);
    if (!job) {
      return responseHandler.error(
        res,
        `Job not found for ID: ${job_id}`,
        resCode.NOT_FOUND
      );
    }

    // ✅ Get all employee documents
    const employees = await employeeModel.find({ _id: { $in: emp_ids } });
    const foundEmpIds = employees.map((emp) => emp._id.toString());
    const missingEmpIds = emp_ids.filter(
      (id: string) => !foundEmpIds.includes(id)
    );

    if (missingEmpIds.length > 0) {
      return responseHandler.error(
        res,
        `Employee(s) not found for ID(s): ${missingEmpIds.join(", ")}`,
        resCode.NOT_FOUND
      );
    }

    // ✅ Check already assigned
    const existingAssignments = await employeeJobModel.find({
      emp_id: { $in: emp_ids },
    });

    const alreadyAssignedEmpIds = existingAssignments.map((ea) =>
      ea.emp_id.toString()
    );

    if (alreadyAssignedEmpIds.length > 0) {
      const alreadyAssignedEmpNames = employees
        .filter((emp) => alreadyAssignedEmpIds.includes(emp._id.toString()))
        .map((emp) => emp.emp_name)
        .join(", ");

      return responseHandler.error(
        res,
        `These employees are already assigned a job: ${alreadyAssignedEmpNames}`,
        resCode.BAD_REQUEST
      );
    }

    // ✅ Create assignments
    const assignments = await employeeJobModel.insertMany(
      emp_ids.map((emp_id) => ({
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
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return responseHandler.error(
        res,
        messages.join(", "),
        resCode.BAD_REQUEST
      );
    }

    return next(error); // fallback for unknown errors
  }
};

// ✅ Get all employee-job associations with full details
const getAllEmployeeJobMappings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mappings = await employeeJobModel
      .find()
      .populate("emp_id") // pulls employee document
      .populate("job_id"); // pulls job document

    return responseHandler.success(
      res,
      "All employee-job mappings fetched",
      mappings,
      resCode.OK
    );
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return responseHandler.error(
        res,
        messages.join(", "),
        resCode.BAD_REQUEST
      );
    }

    return next(error); // fallback for unknown errors
  }
};

export default {
  assignJobToEmployee,
  assignJobToManyEmployees,
  getAllEmployeeJobMappings,
};
