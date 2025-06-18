// import { Request, Response, NextFunction } from "express";
// import customerModel from "../models/customer.model";
// import { hashPassword } from "../services/password.service";
// import { responseHandler } from "../services/responseHandler.service";
// import { resCode } from "../constants/resCode";
// import { customerValidations } from "../validations/customer.validation";
// import mongoose from "mongoose";
// import employeeModel from "../models/employee.model";
// import { msg } from "../constants/language/en.constant";
// import commonQuery from "../services/comonQuery.service";

// const customerQuery = commonQuery(customerModel);
// // ➕ Add Customer
// const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Validate request body with Zod
//     const parsed =
//       await customerValidations.customerCreateSchema.safeParseAsync(req.body);
//     if (!parsed.success) {
//       const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
//       return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
//     }

//     const {
//       cus_password,
//       cus_confirm_password,
//       cus_email,
//       cus_phone_number,
//       cus_firstname,
//       cus_lastname,
//       cus_status = "active",
//     } = parsed.data;

//     const existing = await customerModel.findOne({
//       $or: [{ cus_email }, { cus_phone_number }],
//     });

//     if (existing) {
//       if (
//         existing.cus_email === cus_email &&
//         existing.cus_phone_number === cus_phone_number
//       ) {
//         return responseHandler.error(
//           res,
//           "Email and phone number already exist",
//           resCode.BAD_REQUEST
//         );
//       } else if (existing.cus_email === cus_email) {
//         return responseHandler.error(
//           res,
//           "Email already exists",
//           resCode.BAD_REQUEST
//         );
//       } else if (existing.cus_phone_number === cus_phone_number) {
//         return responseHandler.error(
//           res,
//           "Phone number already exists",
//           resCode.BAD_REQUEST
//         );
//       }
//     }

//     // Hash password
//     const hashedPassword = await hashPassword(cus_password);

//     // Create new customer
//     const newCustomer = await customerModel.create({
//       cus_firstname,
//       cus_lastname,
//       cus_email,
//       cus_phone_number,
//       cus_password: hashedPassword,
//       cus_status,
//     });

//     return responseHandler.success(
//       res,
//       "Customer added successfully",
//       newCustomer,
//       resCode.CREATED
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };

// // 📄 Get All Customers
// const getCustomers = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const customers = await customerModel.find();
//     return responseHandler.success(
//       res,
//       "Customers fetched successfully",
//       customers,
//       resCode.OK
//     );
//   } catch (error: any) {
//     if (error instanceof mongoose.Error.ValidationError) {
//       const messages = Object.values(error.errors).map((err) => err.message);
//       return responseHandler.error(
//         res,
//         messages.join(", "),
//         resCode.BAD_REQUEST
//       );
//     }

//     return next(error); // fallback for unknown errors
//   }
// };

// // 🔍 Get Customer by ID with associated employees
// const getCustomerById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Step 1: Find customer by cus_id
//     const customer = await customerModel.findOne({
//       cus_id: Number(req.params.id),
//     });
//     if (!customer) {
//       return responseHandler.error(
//         res,
//         "Customer not found",
//         resCode.NOT_FOUND
//       );
//     }

//     // Step 2: Find employees related to this customer
//     const employees = await employeeModel.find({ cus_id: customer.cus_id });

//     // Step 3: Combine data
//     const result = {
//       ...customer.toObject(), // convert Mongoose document to plain JS object
//       employees,
//     };

//     return responseHandler.success(res, "Customer found", result, resCode.OK);
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };
// // ✏️ Update Customer by ID
// const updateCustomer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const parsed = customerValidations.customerUpdateSchema.safeParse(req.body);
//     if (!parsed.success) {
//       const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
//       return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
//     }

//     const updatedCustomer = await customerModel.findOneAndUpdate(
//       { cus_id: Number(req.params.id) }, // filter by cus_id
//       parsed.data, // update data
//       { new: true } // return updated document
//     );

//     if (!updatedCustomer) {
//       return responseHandler.error(
//         res,
//         "Customer not found",
//         resCode.NOT_FOUND
//       );
//     }

//     return responseHandler.success(
//       res,
//       "Customer updated successfully",
//       updatedCustomer,
//       resCode.OK
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };

// // ❌ Delete Customer by ID
// const deleteCustomerById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const deletedCustomer = await customerModel.findOneAndDelete({
//       cus_id: Number(req.params.id), // make sure to cast if cus_id is a number
//     });
//     if (!deletedCustomer) {
//       return responseHandler.error(
//         res,
//         "Customer not found",
//         resCode.NOT_FOUND
//       );
//     }

//     return responseHandler.success(
//       res,
//       "Customer deleted successfully",
//       null,
//       resCode.OK
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };

// export default {
//   addCustomer,
//   getCustomers,
//   getCustomerById,
//   updateCustomer,
//   deleteCustomerById,
// };


import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import customerModel from "../models/customer.model";
import employeeModel from "../models/employee.model";
import { hashPassword } from "../services/password.service";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { customerValidations } from "../validations/customer.validation";
import { msg } from "../constants/language/en.constant";
import commonQueryMongo from "../services/comonQuery.service"; // assuming the path

const customerQuery = commonQueryMongo(customerModel);

// ➕ Add Customer
const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    const hashedPassword = await hashPassword(cus_password);

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


// 📄 Get All Customers with Pagination
const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const results_per_page = parseInt(req.query.results_per_page as string, 10) || 10;

    const result = await customerQuery.getAll({}, {
      page,
      limit: results_per_page
    });

    const customers = result.data;
    const cus_ids = customers.map((customer: any) => customer.cus_id);

    const employees = await employeeModel.find({ cus_id: { $in: cus_ids } }).lean();

    const customers_with_employees = customers.map((customer: any) => {
      const related_employees = employees.filter(emp => emp.cus_id === customer.cus_id);
      return {
        ...customer,
        employees: related_employees,
      };
    });

    return responseHandler.success(res, msg.customer.fetchSuccess, {
      ...result.pagination,
      data: customers_with_employees,
    }, resCode.OK);

  } catch (error) {
    return next(error);
  }
};

// 🔍 Get Customer by ID with associated employees
const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customerQuery.getOne({ cus_id: Number(req.params.id) });
    if (!customer) {
      return responseHandler.error(res, msg.customer.notFound, resCode.NOT_FOUND);
    }

    const employees = await employeeModel.find({ cus_id: customer.cus_id });

    const result = {
      ...customer.toObject(),// Convert Document to plain object
      employees,
    };

    return responseHandler.success(res, msg.common.fetchSuccess, result, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

// ✏️ Update Customer by ID
const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = await customerValidations.customerUpdateSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const result = await customerQuery.update({ cus_id: Number(req.params.id) }, parsed.data);

    if (result.affectedCount === 0) {
      return responseHandler.error(res, msg.customer.notFound, resCode.NOT_FOUND);
    }

    return responseHandler.success(res, msg.customer.updateSuccess, result.updatedRows[0], resCode.OK);
  } catch (error) {
    return next(error);
  }
};

// ❌ Delete Customer by ID
const deleteCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
