import { Request, Response, NextFunction } from "express";
import customerModel from "../models/customer.model";
import { hashPassword } from "../services/password.service";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { customerValidations } from "../validations/customer.validation";
import mongoose from "mongoose";

// ➕ Add Customer
const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body with Zod
    const parsed = customerValidations.customerCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const {
      cus_password,
      cus_confirm_password,
      cus_email,
      cus_phone_number,
      cus_firstname,
      cus_lastname,
      cus_status = "active",
    } = parsed.data;

    // Password confirm check
    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(
        res,
        "Password and confirm password do not match",
        resCode.BAD_REQUEST
      );
    }

  
const existing = await customerModel.findOne({
  $or: [{ cus_email }, { cus_phone_number }],
});

if (existing) {
  if (existing.cus_email === cus_email && existing.cus_phone_number === cus_phone_number) {
    return responseHandler.error(res, "Email and phone number already exist", resCode.BAD_REQUEST);
  } else if (existing.cus_email === cus_email) {
    return responseHandler.error(res, "Email already exists", resCode.BAD_REQUEST);
  } else if (existing.cus_phone_number === cus_phone_number) {
    return responseHandler.error(res, "Phone number already exists", resCode.BAD_REQUEST);
  }
}

    // Hash password
    const hashedPassword = await hashPassword(cus_password);

    // Create new customer
    const newCustomer = await customerModel.create({
      cus_firstname,
      cus_lastname,
      cus_email,
      cus_phone_number,
      cus_password: hashedPassword,
      cus_status,
    });

    return responseHandler.success(
      res,
      "Customer added successfully",
      newCustomer,
      resCode.CREATED
    );
  } catch (error: any) {
      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => err.message);
        return responseHandler.error(res, messages.join(", "), resCode.BAD_REQUEST);
      }
  
      return next(error); // fallback for unknown errors
    }
  };


// 📄 Get All Customers
const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await customerModel.find();
    return responseHandler.success(
      res,
      "Customers fetched successfully",
      customers,
      resCode.OK
    );
  }catch (error: any) {
      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => err.message);
        return responseHandler.error(res, messages.join(", "), resCode.BAD_REQUEST);
      }
  
      return next(error); // fallback for unknown errors
    }
  };
// 🔍 Get Customer by ID
const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customerModel.findById(req.params.id);
    if (!customer) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    return responseHandler.success(res, "Customer found", customer, resCode.OK);
  } catch (error: any) {
      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => err.message);
        return responseHandler.error(res, messages.join(", "), resCode.BAD_REQUEST);
      }
  
      return next(error); // fallback for unknown errors
    }
  };

// ✏️ Update Customer by ID
const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = customerValidations.customerUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const updatedCustomer = await customerModel.findByIdAndUpdate(
      req.params.id,
      parsed.data,
      { new: true }
    );

    if (!updatedCustomer) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    return responseHandler.success(
      res,
      "Customer updated successfully",
      updatedCustomer,
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

// ❌ Delete Customer by ID
const deleteCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedCustomer = await customerModel.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
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
  } catch (error: any) {
      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => err.message);
        return responseHandler.error(res, messages.join(", "), resCode.BAD_REQUEST);
      }
  
      return next(error); // fallback for unknown errors
    }
  };

export default {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomerById,
};
