import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import customerModel from "../models/customer.model";
import employeeModel from "../models/employee.model";
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
    // ✅ Parse pagination parameters from query
    const page = parseInt(req.query.page as string, 10) || 1;
    const results_per_page = parseInt(req.query.results_per_page as string, 10) || 10;

    // ✅ Fetch paginated customer data
    const result = await customerQuery.getAll({}, { page, limit: results_per_page });

    const customers = result.data;
    const cus_ids = customers.map((customer: any) => customer.cus_id);

    // ✅ Fetch all employees linked to these customer IDs
    const employees = await employeeModel.find({ cus_id: { $in: cus_ids } }).lean();

    // ✅ Attach related employees to each customer
    const customers_with_employees = customers.map((customer: any) => {
      const related_employees = employees.filter(emp => emp.cus_id === customer.cus_id);
      return {
        ...customer,
        employees: related_employees,
      };
    });

    return responseHandler.success(
      res,
      msg.customer.fetchSuccess,
      {
        ...result.pagination,
        data: customers_with_employees,
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
    // ✅ Find customer by cus_id
    const customer = await customerQuery.getOne({ cus_id: Number(req.params.id) });
    if (!customer) {
      return responseHandler.error(res, msg.customer.notFound, resCode.NOT_FOUND);
    }

    // ✅ Find all employees linked to this customer
    const employees = await employeeModel.find({ cus_id: customer.cus_id });

    const result = {
      ...customer.toObject(),
      employees,
    };

    return responseHandler.success(res, msg.common.fetchSuccess, result, resCode.OK);
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

    // ✅ Update customer by cus_id
    const result = await customerQuery.update({ cus_id: Number(req.params.id) }, parsed.data);

    if (result.affectedCount === 0) {
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
    // ✅ Delete customer by cus_id
    const result = await customerQuery.deleteById({ cus_id: Number(req.params.id) });

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
