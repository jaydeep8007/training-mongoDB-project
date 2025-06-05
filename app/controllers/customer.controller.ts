import { Request, Response, NextFunction } from "express";
import customerModel from "../models/customer.model";
import { hashPassword } from "../services/password.service";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { Op, ValidationError } from "sequelize"; // <-- Import Op here
import { customerValidations } from "../validations/customer.validation";
// ➕ Add Customer

const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = customerValidations.customerCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return res.status(400).json({ message: errorMsg });
    }
    const {
      cus_password,
      cus_confirm_password,
      cus_email,
      cus_phone_number,
      cus_firstname,
      cus_lastname,
      cus_status = "active",
    } = parsed.data as typeof parsed.data & {
      cus_status: "active" | "inactive" | "restricted" | "blocked";
    };

    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(
        res,
        "Password and confirm password do not match",
        resCode.BAD_REQUEST
      );
    }

    const existing = await customerModel.findOne({
      where: {
        [Op.or]: [
          // <-- Use Op.or here
          { cus_email: req.body.cus_email },
          { cus_phone_number: req.body.cus_phone_number },
        ],
      },
    });

    if (existing) {
      return responseHandler.error(
        res,
        "Email or phone already exists",
        resCode.BAD_REQUEST
      );
    }

    const hashedPassword = await hashPassword(cus_password);

    const newCustomer = await customerModel.create({
      cus_firstname,
      cus_lastname,
      cus_email,
      cus_phone_number,
      cus_password: hashedPassword,
      cus_status, // Status string, default to "active"
    });

    return responseHandler.success(
      res,
      "Customer added successfully",
      newCustomer,
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

// 📄 Get All Customers
const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customers = await customerModel.findAll();
    return responseHandler.success(
      res,
      "Customers fetched successfully",
      customers,
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

// 🔍 Get Customer by ID
const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await customerModel.findByPk(req.params.id);

    if (!customer) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    return responseHandler.success(res, "Customer found", customer, resCode.OK);
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

// ✏️ Update Customer by ID
const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find customer first
    const customer = await customerModel.findByPk(req.params.id);

    if (!customer) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    // ✅ Validate request body
    const parsed = customerValidations.customerUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    // Update in DB using Sequelize's update method
    const [affectedRows] = await customerModel.update(parsed.data, {
      where: { cus_id: req.params.id },
    });

    if (affectedRows === 0) {
      return responseHandler.error(res, "Update failed", resCode.BAD_REQUEST);
    }

    // Fetch the updated customer again
    const updatedCustomer = await customerModel.findByPk(req.params.id);

    return responseHandler.success(
      res,
      "Customer updated successfully",
      updatedCustomer,
      resCode.OK
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      const messages = error.errors.map((err) => err.message);
      return responseHandler.error(
        res,
        messages.join(", "),
        resCode.BAD_REQUEST
      );
    }

    return next(error);
  }
};

// ❌ Delete Customer by ID
const deleteCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await customerModel.destroy({
      where: { cus_id: req.params.id },
    });

    if (!deleted) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    return responseHandler.success(
      res,
      "Customer deleted successfully",
      null,
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
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomerById,
};
