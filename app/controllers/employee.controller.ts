// import { Request, Response, NextFunction } from "express";
// import employeeModel from "../models/employee.model"; // ✅ Mongoose model
// import { employeeCreateSchema } from "../validations/employee.validation";
// import { responseHandler } from "../services/responseHandler.service";
// import { resCode } from "../constants/resCode";
// import customerModel from "../models/customer.model";

// const createEmployee = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//   const parsed = await employeeCreateSchema.safeParseAsync(req.body);
// if (!parsed.success) {
//   const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
//   return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
// }

//     const { emp_email, cus_id } = parsed.data;

//     // 🔎 Check if provided cus_id is valid (i.e., exists in customer collection)
//     const customerExists = await customerModel.findOne({ cus_id });
//     if (!customerExists) {
//       return responseHandler.error(
//         res,
//         "Invalid cus_id: Customer does not exist",
//         resCode.BAD_REQUEST
//       );
//     }

//      const emailExists = await employeeModel.findOne({ emp_email }); 
//     if (emailExists) {
//       return responseHandler.error(
//         res,
//         "Email already exists",
//         resCode.BAD_REQUEST
//       );
//     }

//     // ✅ Create employee
//     const newEmployee = await employeeModel.create(parsed.data);

//     return responseHandler.success(
//       res,
//       "Employee created successfully",
//       newEmployee,
//       resCode.CREATED
//     );
//   } catch (error: any) {
//     return next(error);
//   }
// };

// // ✅ Get all employees
// const getAllEmployees = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const employees = await employeeModel.find();

//     return responseHandler.success(
//       res,
//       "Employees fetched successfully",
//       employees,
//       resCode.OK
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };

// export default {
//   createEmployee,
//   getAllEmployees,
// };


import { Request, Response, NextFunction } from "express";
import employeeModel from "../models/employee.model";
import customerModel from "../models/customer.model";
import employeeValidation from "../validations/employee.validation";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { msg } from "../constants/language/en.constant";
import commonQueryMongo from "../services/comonQuery.service";

const employeeQuery = commonQueryMongo(employeeModel);
const customerQuery = commonQueryMongo(customerModel);

const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = await employeeValidation.employeeCreateSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

const { emp_email, cus_id, emp_mobile_number } = parsed.data;

// Check if customer exists
const customerExists = await customerQuery.getOne({ cus_id });
if (!customerExists) {
  return responseHandler.error(res, msg.customer.idNotFound, resCode.BAD_REQUEST);
}

// Check if employee email already exists
const emailExists = await employeeQuery.getOne({ emp_email });
if (emailExists) {
  return responseHandler.error(res, msg.employee.emailExists, resCode.BAD_REQUEST);
}

// Check if employee mobile number already exists
const mobileExists = await employeeQuery.getOne({ emp_mobile_number });
if (mobileExists) {
  return responseHandler.error(res, msg.employee.mobileExists, resCode.BAD_REQUEST);
}
// Create new employee
const newEmployee = await employeeQuery.create(parsed.data);

    return responseHandler.success(res, msg.employee.createSuccess, newEmployee, resCode.CREATED);
  } catch (error) {
    return next(error);
  }
};

// 📄 Get All Employees with Pagination via employeeQuery.getAll
const getAllEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Fetch paginated employees with populated customer info
    const employees = await employeeQuery.getAll(
      { /* filter criteria if needed, e.g. { isActive: true } */ },
      { skip: offset, limit }
    );

    // Total count for pagination
    const total = await employeeModel.countDocuments(/* same filter if used */);

    return responseHandler.success(
      res,
      msg.employee.fetchSuccess,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit), // ensures complete coverage
        employees,
      },
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};


const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Convert and validate emp_id from params
    const {id} = req.params;
    // Find employee by emp_id
    const employee = await employeeQuery.getOne({ emp_id: id });

    if (!employee) {
      return responseHandler.error(res, msg.employee.notFound, resCode.NOT_FOUND);
    }
    // Delete the employee
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

 const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const emp_id = Number(id);

    if (isNaN(emp_id)) {
      return responseHandler.error(res, msg.employee.invalidId, resCode.BAD_REQUEST);
    }

    const parsed = await employeeValidation.employeeUpdateSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const employee = await employeeQuery.getOne({ emp_id });
    if (!employee) {
      return responseHandler.error(res, msg.employee.notFound, resCode.NOT_FOUND);
    }

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


export default {
  createEmployee,
  getAllEmployees,
  deleteEmployee,
  updateEmployee
};
