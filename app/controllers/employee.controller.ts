import { NextFunction, Request, Response } from "express";
import employeeModel from "../models/employee.model";
import job from "../models/job.model";
import { employeeCreateSchema } from "../validations/employee.validation";
import { resCode } from "../constants/resCode";
import { responseHandler } from "../services/responseHandler.service";
import { ValidationError } from "sequelize";


// Create a new employee with Zod validation
const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = employeeCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }
    console.log("Parsed data:", parsed.data);

    const newEmployee = await employeeModel.create(parsed.data);

    return responseHandler.success(
      res,
      "Employee created successfully",
      newEmployee,
      resCode.CREATED
    );
  } catch (error) {
    // ✅ Handle Sequelize validation errors
    if (error instanceof ValidationError) {
      const messages = error.errors.map((err) => err.message);
      return responseHandler.error(
        res,
        messages.join(", "),
        resCode.BAD_REQUEST
      );
    }
    // 🔁 Forward any other unhandled error to the global error handler
    return next(error);
  }
};


const getAllEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await employeeModel.findAll();

    return responseHandler.success(
      res,
      "Employees feched succesfully",
      employees,
      resCode.OK
    );
  } catch (error) {
    // ✅ Handle Sequelize validation errors
    if (error instanceof ValidationError) {
      const messages = error.errors.map((err) => err.message);
      return responseHandler.error(
        res,
        messages.join(", "),
        resCode.BAD_REQUEST
      );
    }

    // 🔁 Forward any other unhandled error to the global error handler
    return next(error);
  }
};

export default {
  getAllEmployees,
  createEmployee,
};
