import { Request, Response, NextFunction } from "express";
import employeeJobModel from "../models/employeeJob.model";
import employeeModel from "../models/employee.model";
import jobModel from "../models/job.model";
import employeeJobValidation from "../validations/employeeJob.validation";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";

import { msg } from "../constants/language/en.constant";

// // ✅ Assign job to single employee
// const assignJobToEmployee = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const parsed = employeeJobValidation.assignJobSchema.safeParse(req.body);
//     if (!parsed.success) {
//       const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
//       return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
//     }

//     const { emp_id, job_id } = parsed.data;

//     // Check if job exists
//     const jobExists = await jobModel.findById(job_id);
//     if (!jobExists) {
//       return responseHandler.error(res, "Job not found", resCode.NOT_FOUND);
//     }

//     // Check if employee exists
//     const employeeExists = await employeeModel.findById(emp_id);
//     if (!employeeExists) {
//       return responseHandler.error(
//         res,
//         "Employee not found",
//         resCode.NOT_FOUND
//       );
//     }

//     // Check if already assigned
//     const alreadyAssigned = await employeeJobModel.findOne({ emp_id });
//     if (alreadyAssigned) {
//       return responseHandler.error(
//         res,
//         "Employee is already assigned a job",
//         resCode.BAD_REQUEST
//       );
//     }

//     const assignment = await employeeJobModel.create({ emp_id, job_id });

//     return responseHandler.success(
//       res,
//       "Job assigned to employee successfully",
//       assignment,
//       resCode.CREATED
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };
const assignJobToEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed =await employeeJobValidation.assignJobSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_id, job_id } = parsed.data;

    // Fetch employee and job data in parallel
    const [employee, job] = await Promise.all([
      employeeModel.findOne({ emp_id }),
      jobModel.findOne({ job_id }),
    ]);

    // Handle missing job
    if (!job) {
      return responseHandler.error(
        res,
        `Job with ID ${job_id} not found`,
        resCode.NOT_FOUND
      );
    }

    // Handle missing employee
    if (!employee) {
      return responseHandler.error(
        res,
        `Employee with ID ${emp_id} not found`,
        resCode.NOT_FOUND
      );
    }

    // Check if already assigned
    const alreadyAssigned = await employeeJobModel.findOne({ emp_id });
    if (alreadyAssigned) {
      return responseHandler.error(
        res,
        `Employee "${employee.emp_name}" is already assigned a job`,
        resCode.BAD_REQUEST
      );
    }

    // Create assignment
    const assignment = await employeeJobModel.create({ emp_id, job_id });

    const result = {
      emp_id: employee.emp_id,
      emp_name: employee.emp_name,
      job_id: job.job_id,
      job_name: job.job_name,
      assignedAt: assignment.createdAt,
    };

    return responseHandler.success(
      res,
      "Job assigned to employee successfully",
      result,
      resCode.CREATED
    );
  } catch (error: any) {
    return next(error); // fallback for unknown errors
  }
};

const assignJobToManyEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = await employeeJobValidation.assignMultipleJobsSchema.safeParseAsync(
      req.body
    );

    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_ids, job_id } = parsed.data;

    // ✅ Find job by job_id (number)
    const job = await jobModel.findOne({ job_id });
    if (!job) {
      return responseHandler.error(
        res,
        `Job not found for ID: ${job_id}`,
        resCode.NOT_FOUND
      );
    }

    // ✅ Find all employees matching emp_ids (number)
    const employees = await employeeModel.find({ emp_id: { $in: emp_ids } });
    const foundEmpIds = employees.map((emp) => emp.emp_id);
    const missingEmpIds = emp_ids.filter((id: number) => !foundEmpIds.includes(id));

    if (missingEmpIds.length > 0) {
      return responseHandler.error(
        res,
        `Employee(s) not found for ID(s): ${missingEmpIds.join(", ")}`,
        resCode.NOT_FOUND
      );
    }

    // ✅ Check if any employees already have a job
    const existingAssignments = await employeeJobModel.find({
      emp_id: { $in: emp_ids },
    });

    const alreadyAssignedEmpIds = existingAssignments.map((ea) => ea.emp_id);

    if (alreadyAssignedEmpIds.length > 0) {
      const alreadyAssignedEmpNames = employees
        .filter((emp) => alreadyAssignedEmpIds.includes(emp.emp_id))
        .map((emp) => emp.emp_name)
        .join(", ");

      return responseHandler.error(
        res,
        `These employees are already assigned a job: ${alreadyAssignedEmpNames}`,
        resCode.BAD_REQUEST
      );
    }

    // ✅ Assign job to all employees
    const assignments = await employeeJobModel.insertMany(
      emp_ids.map((emp_id: number) => ({
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
  assignJobToManyEmployees
};
