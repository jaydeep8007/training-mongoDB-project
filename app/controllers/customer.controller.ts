import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import customerModel from "../models/customer.model";
import { hashPassword } from "../services/password.service";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { customerValidations } from "../validations/customer.validation";
import { msg } from "../constants/language/en.constant";
import commonQueryMongo from "../services/comonQuery.service";

const customerQuery = commonQueryMongo(customerModel);

/* ============================================================================
 * ➕ Add Customer
 * ============================================================================
 */
const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ✅ Validate input using Zod schema
    const parsed = await customerValidations.customerCreateSchema.safeParseAsync(req.body);
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

    // ✅ Check if customer with same email or phone already exists
    const existing = await customerQuery.getOne({
      $or: [{ cus_email }, { cus_phone_number }],
    });

    if (existing) {
      if (
        existing.cus_email === cus_email &&
        existing.cus_phone_number === cus_phone_number
      ) {
        return responseHandler.error(res, msg.common.alreadyExists, resCode.BAD_REQUEST);
      } else if (existing.cus_email === cus_email) {
        return responseHandler.error(res, msg.customer.emailAlreadyExists, resCode.BAD_REQUEST);
      } else if (existing.cus_phone_number === cus_phone_number) {
        return responseHandler.error(res, msg.common.phoneExists, resCode.BAD_REQUEST);
      }
    }

    // ✅ Hash the password before saving
    const hashedPassword = await hashPassword(cus_password);

    // ✅ Create and save the new customer
    const newCustomer = await customerQuery.create({
      cus_firstname,
      cus_lastname,
      cus_email,
      cus_phone_number,
      cus_password: hashedPassword,
      cus_status,
    });

    return responseHandler.success(res, msg.customer.createSuccess, newCustomer, resCode.CREATED);
  } catch (error) {
    return next(error);
  }
};

/* ============================================================================
 * 📄 Get All Customers (with pagination & associated employees)
 * ============================================================================
 */
const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, results_per_page } = req.query;

    // 🔄 Aggregation to fetch employees linked with customer
    const pipeline = [
      {
        $lookup: {
          from: "employee",           // collection name
          localField: "_id",          // customer._id
          foreignField: "cus_id",     // employee.cus_id
          as: "employee",
        },
      },
    ];

    // 🔎 Use aggregation-based query from commonQueryMongo
    const result = await customerQuery.getAllWithAggregation(pipeline, {
      page,
      limit: results_per_page,
    });

    return responseHandler.success(
      res,
      msg.customer.fetchSuccess,
      {
        ...result.pagination,
        customer: result.data,
      },
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};



/* ============================================================================
 * 🔍 Get Customer by ID (with associated employees)
 * ============================================================================
 */
const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return responseHandler.error(res, msg.common.invalidId, resCode.BAD_REQUEST);
    }

    // ✅ Use aggregation with $lookup to fetch customer + employees
    const customer = await customerModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(customerId) },
      },
      {
        $lookup: {
          from: "employee", // Collection name
          localField: "_id", // Customer _id
          foreignField: "cus_id", // Employee reference field
          as: "employee",
        },
      },
    ]);

    if (!customer || customer.length === 0) {
      return responseHandler.error(res, msg.customer.notFound, resCode.NOT_FOUND);
    }

    return responseHandler.success(res, msg.common.fetchSuccess, customer[0], resCode.OK);
  } catch (error) {
    return next(error);
  }
};



/* ============================================================================
 * ✏️ Update Customer by ID
 * ============================================================================
 */
const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ✅ Validate input using Zod
    const parsed = await customerValidations.customerUpdateSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return responseHandler.error(res, msg.common.invalidId, resCode.BAD_REQUEST);
    }

    // ✅ Update by _id (ObjectId)
    const result = await customerQuery.update({ _id: customerId }, parsed.data);

    if (!result.updatedRows || result.updatedRows.length === 0) {
      return responseHandler.error(res, msg.customer.notFound, resCode.NOT_FOUND);
    }

    return responseHandler.success(
      res,
      msg.customer.updateSuccess,
      result.updatedRows[0],
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};


/* ============================================================================
 * ❌ Delete Customer by ID
 * ============================================================================
 */
const deleteCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return responseHandler.error(res, msg.common.invalidId, resCode.BAD_REQUEST);
    }

    // ✅ Delete by _id
    const result = await customerQuery.deleteById({ _id: customerId });

    if (!result.deleted) {
      return responseHandler.error(res, msg.customer.notFound, resCode.NOT_FOUND);
    }

    return responseHandler.success(res, msg.customer.deleteSuccess, null, resCode.OK);
  } catch (error) {
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
