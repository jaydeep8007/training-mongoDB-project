import { Request, Response, NextFunction } from "express";
import employeeModel from "../models/employee.model";
import customerModel from "../models/customer.model";
import employeeValidation from "../validations/employee.validation";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { msg } from "../constants/language/en.constant";
import commonQueryMongo from "../services/comonQuery.service";
import mongoose from "mongoose";


// Create reusable query methods for both models
const employeeQuery = commonQueryMongo(employeeModel);
const customerQuery = commonQueryMongo(customerModel);

/* ============================================================================
 * 👷 Create New Employee
 * ============================================================================
 */

const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Validate request using Zod
    const parsed = await employeeValidation.employeeCreateSchema.safeParseAsync(
      req.body
    );
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_email, cus_id, emp_mobile_number } = parsed.data;

    // ✅ Validate cus_id is a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(cus_id)) {
      return responseHandler.error(
        res,
        msg.common.invalidId,
        resCode.BAD_REQUEST
      );
    }

    // 🔍 Check if customer exists by _id
    const customerExists = await customerQuery.getById(cus_id);
    if (!customerExists) {
      return responseHandler.error(
        res,
        msg.customer.idNotFound,
        resCode.BAD_REQUEST
      );
    }

    // 🚫 Check for duplicate email
    const emailExists = await employeeQuery.getOne({ emp_email });
    if (emailExists) {
      return responseHandler.error(
        res,
        msg.employee.emailExists,
        resCode.BAD_REQUEST
      );
    }

    // 🚫 Check for duplicate mobile number
    const mobileExists = await employeeQuery.getOne({ emp_mobile_number });
    if (mobileExists) {
      return responseHandler.error(
        res,
        msg.employee.mobileExists,
        resCode.BAD_REQUEST
      );
    }

    // ✅ Create employee
    const newEmployee = await employeeQuery.create(parsed.data);

    return responseHandler.success(
      res,
      msg.employee.createSuccess,
      newEmployee,
      resCode.CREATED
    );
  } catch (error) {
    return next(error);
  }
};
/* ============================================================================
 * 📄 Get All Employees - Supports Pagination
 * ============================================================================
 */
// const getAllEmployees = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     const employeesWithJobs = await employeeModel.aggregate([
//       // 1️⃣ Lookup employeejob to find assigned job_id
//       {
//         $lookup: {
//           from: "employeejob",
//           localField: "_id",
//           foreignField: "emp_id",
//           as: "jobAssignment",
//         },
//       },
//       {
//         $unwind: {
//           path: "$jobAssignment",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       // 2️⃣ Lookup job details from job_id
//       {
//         $lookup: {
//           from: "job",
//           localField: "jobAssignment.job_id",
//           foreignField: "_id",
//           as: "job",
//         },
//       },
//       {
//         $unwind: {
//           path: "$job",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       // 3️⃣ Select only necessary fields
//       {
//         $project: {
//           emp_name: 1,
//           emp_email: 1,
//           emp_mobile_number: 1,
//           emp_company_name: 1,
//           job: {
//             job_name: "$job.job_name",
//             job_sku: "$job.job_sku",
//             job_category: "$job.job_category",
//           },
//         },
//       },
//       // 4️⃣ Pagination
//       { $skip: skip },
//       { $limit: limit },
//     ]);

//     // Get total count of employees (not affected by job assignment)
//     const total = await employeeModel.countDocuments();

//     return responseHandler.success(
//       res,
//       msg.employee.fetchSuccess,
//       {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//         employees: employeesWithJobs,
//       },
//       resCode.OK
//     );
//   } catch (error) {
//     return next(error);
//   }
// };


const getAllEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, results_per_page } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: "employeejob",
          localField: "_id",
          foreignField: "emp_id",
          as: "jobAssignment",
        },
      },
      {
        $unwind: {
          path: "$jobAssignment",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "job",
          localField: "jobAssignment.job_id",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: {
          path: "$job",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          emp_name: 1,
          emp_email: 1,
          emp_mobile_number: 1,
          emp_company_name: 1,
          job: {
            job_name: "$job.job_name",
            job_sku: "$job.job_sku",
            job_category: "$job.job_category",
          },
        },
      },
    ];

    const result = await employeeQuery.getAllWithAggregation(pipeline, {
      page,
      limit: results_per_page,
    });

    return responseHandler.success(
      res,
      msg.employee.fetchSuccess,
      {
        ...result.pagination,
        rows: result.data,
      },
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};


/* ============================================================================
 * ❌ Delete Employee by emp_id
 * ============================================================================
 */

const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler.error(
        res,
        msg.common.invalidId,
        resCode.BAD_REQUEST
      );
    }

    // 🔍 Find employee by _id
    const employee = await employeeModel.findById(id);
    if (!employee) {
      return responseHandler.error(
        res,
        msg.employee.notFound,
        resCode.NOT_FOUND
      );
    }

    // 🗑️ Delete employee document
    await employeeModel.deleteOne({ _id: id });

    return responseHandler.success(
      res,
      msg.employee.deleteSuccess,
      null,
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};

/* ============================================================================
 * 🔁 Update Employee by emp_id
 * ============================================================================
 */

const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return responseHandler.error(
        res,
        msg.employee.invalidId,
        resCode.BAD_REQUEST
      );
    }

    // 🚫 Prevent emp_id update attempt
    delete req.body.emp_id;

    const parsed = await employeeValidation.employeeUpdateSchema.safeParseAsync(
      req.body
    );
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const employee = await employeeModel.findById(id);
    if (!employee) {
      return responseHandler.error(
        res,
        msg.employee.notFound,
        resCode.NOT_FOUND
      );
    }

    const updatedEmployee = await employeeModel.findByIdAndUpdate(
      id,
      parsed.data,
      {
        new: true,
      }
    );

    return responseHandler.success(
      res,
      msg.employee.updateSuccess,
      updatedEmployee,
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};

// 📤 Export all controller methods
export default {
  createEmployee,
  getAllEmployees,
  deleteEmployee,
  updateEmployee,
};
