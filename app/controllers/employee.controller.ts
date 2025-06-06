import { Request, Response, NextFunction } from "express";
import employeeModel from "../models/employee.model"; // ✅ Mongoose model
import { employeeCreateSchema } from "../validations/employee.validation";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import mongoose from "mongoose";
const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body with Zod
    const parsed = employeeCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { emp_email, emp_mobile_number } = parsed.data;

    // Check if email exists
    const emailExists = await employeeModel.findOne({ emp_email });
    if (emailExists) {
      return responseHandler.error(res, "Email already exists", resCode.BAD_REQUEST);
    }

    // Check if phone exists
    const phoneExists = await employeeModel.findOne({ emp_mobile_number });
    if (phoneExists) {
      return responseHandler.error(res, "Mobile number already exists", resCode.BAD_REQUEST);
    }

    // Create new employee
    const newEmployee = await employeeModel.create(parsed.data);

    return responseHandler.success(
      res,
      "Employee created successfully",
      newEmployee,
      resCode.CREATED
    );

  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return responseHandler.error(res, messages.join(", "), resCode.BAD_REQUEST);
    }

    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = `${field} already exists`;
      return responseHandler.error(res, message, resCode.BAD_REQUEST);
    }

    return next(error);
  }
};
// ✅ Get all employees
const getAllEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await employeeModel.find();

    return responseHandler.success(
      res,
      "Employees fetched successfully",
      employees,
      resCode.OK
    );
  } catch (error: any) {
      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => err.message);
        return responseHandler.error(res, messages.join(", "), resCode.BAD_REQUEST);
      }
  
      return next(error); // fallback for unknown errors
    }
};

export default {
  createEmployee,
  getAllEmployees,
};
