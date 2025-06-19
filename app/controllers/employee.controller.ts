import { Request, Response, NextFunction } from "express";
import employeeModel from "../models/employee.model";
import customerModel from "../models/customer.model";
import employeeValidation from "../validations/employee.validation";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { msg } from "../constants/language/en.constant";
import commonQueryMongo from "../services/comonQuery.service";

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
    // ✅ Validate incoming request body using Zod schema
    const parsed = await employeeValidation.employeeCreateSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_email, cus_id, emp_mobile_number } = parsed.data;

    // 🔍 Ensure the provided customer (cus_id) exists
    const customerExists = await customerQuery.getOne({ cus_id });
    if (!customerExists) {
      return responseHandler.error(res, msg.customer.idNotFound, resCode.BAD_REQUEST);
    }

    // 🚫 Prevent duplicate employee email
    const emailExists = await employeeQuery.getOne({ emp_email });
    if (emailExists) {
      return responseHandler.error(res, msg.employee.emailExists, resCode.BAD_REQUEST);
    }

    // 🚫 Prevent duplicate mobile number
    const mobileExists = await employeeQuery.getOne({ emp_mobile_number });
    if (mobileExists) {
      return responseHandler.error(res, msg.employee.mobileExists, resCode.BAD_REQUEST);
    }

    // ✅ Create new employee
    const newEmployee = await employeeQuery.create(parsed.data);

    return responseHandler.success(res, msg.employee.createSuccess, newEmployee, resCode.CREATED);
  } catch (error) {
    return next(error);
  }
};

/* ============================================================================
 * 📄 Get All Employees - Supports Pagination
 * ============================================================================
 */
const getAllEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 🔢 Parse pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // 📦 Fetch employees with pagination logic
    const employees = await employeeQuery.getAll({}, { skip: offset, limit });

    // 🔢 Get total employee count
    const total = await employeeModel.countDocuments();

    return responseHandler.success(
      res,
      msg.employee.fetchSuccess,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit), // 🧮 Calculates total pages
        employees,
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

    // 🔍 Find employee by emp_id
    const employee = await employeeQuery.getOne({ emp_id: id });
    if (!employee) {
      return responseHandler.error(res, msg.employee.notFound, resCode.NOT_FOUND);
    }

    // 🗑️ Delete employee document
    await employeeModel.deleteOne({ emp_id: employee.emp_id });

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
    const emp_id = Number(id);

    // 🚫 Validate that emp_id is a valid number
    if (isNaN(emp_id)) {
      return responseHandler.error(res, msg.employee.invalidId, resCode.BAD_REQUEST);
    }

    // ✅ Validate update body
    const parsed = await employeeValidation.employeeUpdateSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    // 🔍 Ensure employee exists
    const employee = await employeeQuery.getOne({ emp_id });
    if (!employee) {
      return responseHandler.error(res, msg.employee.notFound, resCode.NOT_FOUND);
    }

    // 🛠️ Perform update
    const updatedEmployee = await employeeModel.findOneAndUpdate(
      { emp_id },
      parsed.data,
      { new: true }
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
  updateEmployee
};
