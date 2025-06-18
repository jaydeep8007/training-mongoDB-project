// import { Request, Response, NextFunction } from "express";
// import customerModel from "../models/customer.model";
// import customerAuthModel from "../models/customerAuth.model";
// import { comparePasswords, hashPassword } from "../services/password.service";
// import { authToken } from "../services/authToken.service";
// import { responseHandler } from "../services/responseHandler.service";
// import { resCode } from "../constants/resCode";
// import { customerValidations } from "../validations/customer.validation";
// import mongoose from "mongoose";

// const signupCustomer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const parsed = customerValidations.customerCreateSchema.safeParse(req.body);
//     if (!parsed.success) {
//       const errors = parsed.error.errors.map(
//         (err) => `${err.path[0]}: ${err.message}`
//       );
//       return responseHandler.error(res, errors.join(", "), resCode.BAD_REQUEST);
//     }

//     const {
//       cus_firstname,
//       cus_lastname,
//       cus_email,
//       cus_phone_number,
//       cus_password,
//       cus_confirm_password,
//     } = parsed.data;

//     if (cus_password !== cus_confirm_password) {
//       return responseHandler.error(
//         res,
//         "Passwords do not match",
//         resCode.BAD_REQUEST
//       );
//     }

//     const existingCustomer = await customerModel.findOne({
//       $or: [{ cus_email }, { cus_phone_number }],
//     });

//     if (existingCustomer) {
//       let errorMessage = "";

//       if (existingCustomer.cus_email === cus_email) {
//         errorMessage += "Email already exists. ";
//       }

//       if (existingCustomer.cus_phone_number === cus_phone_number) {
//         errorMessage += "Phone number already exists.";
//       }

//       return responseHandler.error(
//         res,
//         errorMessage.trim(),
//         resCode.BAD_REQUEST
//       );
//     }

//     const hashedPassword = await hashPassword(cus_password);

//     const newCustomer = await customerModel.create({
//       cus_firstname,
//       cus_lastname,
//       cus_email,
//       cus_phone_number,
//       cus_password: hashedPassword,
//       cus_status: "active",
//     });

//     const token = authToken.generateAuthToken({
//       user_id: newCustomer._id,
//       email: cus_email,
//     });
//     const refreshToken = authToken.generateRefreshAuthToken({
//       user_id: newCustomer._id,
//       email: cus_email,
//     });

//     await customerAuthModel.create({
//       cus_id: newCustomer._id,
//       cus_auth_token: token,
//       cus_refresh_auth_token: refreshToken,
//     });

//     return responseHandler.success(
//       res,
//       "Customer signed up",
//       {
//         customer: newCustomer,
//         token,
//         refreshToken,
//       },
//       resCode.CREATED
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };

// const signinCustomer = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const parsed = customerValidations.customerLoginSchema.safeParse(req.body);
//     if (!parsed.success) {
//       const errors = parsed.error.errors.map(
//         (err) => `${err.path[0]}: ${err.message}`
//       );
//       return responseHandler.error(res, errors.join(", "), resCode.BAD_REQUEST);
//     }

//     const { cus_email, cus_password } = parsed.data;

//     const customer = await customerModel.findOne({ cus_email });

//     if (!customer) {
//       return responseHandler.error(
//         res,
//         "Customer not found",
//         resCode.NOT_FOUND
//       );
//     }

//     const isValid = await comparePasswords(cus_password, customer.cus_password);
//     if (!isValid) {
//       return responseHandler.error(
//         res,
//         "Invalid password",
//         resCode.UNAUTHORIZED
//       );
//     }

//     const token = authToken.generateAuthToken({
//       user_id: customer._id,
//       email: cus_email,
//     });
//     const refreshToken = authToken.generateRefreshAuthToken({
//       user_id: customer._id,
//       email: cus_email,
//     });

//     await customerAuthModel.create({
//       cus_id: customer._id,
//       cus_auth_token: token,
//       cus_refresh_auth_token: refreshToken,
//     });

//     return responseHandler.success(
//       res,
//       "Login successful",
//       {
//         token,
//         refreshToken,
//         customer: {
//           cus_id: customer._id,
//           cus_firstname: customer.cus_firstname,
//           cus_lastname: customer.cus_lastname,
//           cus_email: customer.cus_email,
//           cus_phone_number: customer.cus_phone_number,
//         },
//       },
//       resCode.OK
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };
// const forgotPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const result = customerValidations.forgotPasswordSchema.safeParse(req.body);
//     if (!result.success) {
//       const errors = result.error.errors.map((e) => e.message).join(", ");
//       return responseHandler.error(res, errors, resCode.BAD_REQUEST);
//     }

//     const { cus_email } = result.data;

//     const customer = await customerModel.findOne({ cus_email });
//     if (!customer) {
//       return responseHandler.error(
//         res,
//         "Customer not found",
//         resCode.NOT_FOUND
//       );
//     }

//     const resetToken = authToken.generateRefreshAuthToken({
//       user_id: customer._id,
//       email: cus_email,
//     });

//     await customerAuthModel.findOneAndUpdate(
//       { cus_id: customer._id },
//       { cus_refresh_auth_token: resetToken },
//       { upsert: true, new: true }
//     );

//     return responseHandler.success(
//       res,
//       "Reset token generated",
//       { reset_token: resetToken },
//       resCode.OK
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };

// const resetPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Validate request body
//     const parsed = customerValidations.resetPasswordSchema.safeParse(req.body);
//     if (!parsed.success) {
//       const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
//       return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
//     }

//     const { reset_token, new_password } = parsed.data;

//     // Find auth entry by reset token
//     const authEntry = await customerAuthModel.findOne({
//       cus_refresh_auth_token: reset_token,
//     });

//     if (!authEntry || !authEntry.cus_id) {
//       return responseHandler.error(
//         res,
//         "Invalid or expired reset token",
//         resCode.UNAUTHORIZED
//       );
//     }

//     // Hash new password
//     const hashedPassword = await hashPassword(new_password);

//     // Update password in customer document
//     await customerModel.updateOne(
//       { _id: authEntry.cus_id },
//       { $set: { cus_password: hashedPassword } }
//     );

//     // Clear the reset token
//     authEntry.cus_refresh_auth_token = "";
//     await authEntry.save();

//     return responseHandler.success(
//       res,
//       "Password reset successfully",
//       {},
//       resCode.OK
//     );
//   } catch (error: any) {
//     // Forward other errors
//     return next(error);
//   }
// };

// export default {
//   signupCustomer,
//   signinCustomer,
//   forgotPassword,
//   resetPassword,
// };

import { Request, Response, NextFunction } from "express";
import customerModel from "../models/customer.model";
import customerAuthModel from "../models/customerAuth.model";
import { comparePasswords, hashPassword } from "../services/password.service";
import { authToken } from "../services/authToken.service";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { msg } from "../constants/language/en.constant";
import { customerValidations } from "../validations/customer.validation";
import commonQueryMongo from "../services/comonQuery.service";

const customerQuery = commonQueryMongo(customerModel);
const customerAuthQuery = commonQueryMongo(customerAuthModel);

const signupCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed =await customerValidations.customerCreateSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(err => `${err.path[0]}: ${err.message}`);
      return responseHandler.error(res, errors.join(", "), resCode.BAD_REQUEST);
    }

    const {
      cus_firstname,
      cus_lastname,
      cus_email,
      cus_phone_number,
      cus_password,
      cus_confirm_password,
    } = parsed.data;

    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(res, msg.auth.passwordMismatch, resCode.BAD_REQUEST);
    }

    const existingCustomer = await customerQuery.getOne({
      $or: [{ cus_email }, { cus_phone_number }],
    });

    if (existingCustomer) {
      const conflicts = [];
      if (existingCustomer.cus_email === cus_email) conflicts.push(msg.auth.emailExists);
      if (existingCustomer.cus_phone_number === cus_phone_number) conflicts.push(msg.auth.phoneExists);

      return responseHandler.error(res, conflicts.join(" "), resCode.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(cus_password);

    const newCustomer = await customerQuery.create({
      cus_firstname,
      cus_lastname,
      cus_email,
      cus_phone_number,
      cus_password: hashedPassword,
      cus_status: "active",
    });

    const token = authToken.generateAuthToken({ user_id: newCustomer._id, email: cus_email });
    const refreshToken = authToken.generateRefreshAuthToken({ user_id: newCustomer._id, email: cus_email });

    await customerAuthQuery.create({
      cus_id: newCustomer._id,
      cus_auth_token: token,
      cus_refresh_auth_token: refreshToken,
    });

    return responseHandler.success(res, msg.auth.signupSuccess, {
      customer: newCustomer,
      token,
      refreshToken,
    }, resCode.CREATED);
  } catch (error) {
    return next(error);
  }
};

const signinCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed =await customerValidations.customerLoginSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(err => `${err.path[0]}: ${err.message}`);
      return responseHandler.error(res, errors.join(", "), resCode.BAD_REQUEST);
    }

    const { cus_email, cus_password } = parsed.data;
    const customer = await customerQuery.getOne({ cus_email });

    if (!customer) {
      return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
    }

    const isValid = await comparePasswords(cus_password, customer.cus_password);
    if (!isValid) {
      return responseHandler.error(res, msg.auth.invalidPassword, resCode.UNAUTHORIZED);
    }

    const token = authToken.generateAuthToken({ user_id: customer._id, email: cus_email });
    const refreshToken = authToken.generateRefreshAuthToken({ user_id: customer._id, email: cus_email });

    await customerAuthQuery.create({
      cus_id: customer._id,
      cus_auth_token: token,
      cus_refresh_auth_token: refreshToken,
    });

    return responseHandler.success(res, msg.auth.loginSuccess, {
      token,
      refreshToken,
      customer: {
        cus_id: customer._id,
        cus_firstname: customer.cus_firstname,
        cus_lastname: customer.cus_lastname,
        cus_email: customer.cus_email,
        cus_phone_number: customer.cus_phone_number,
      },
    }, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerValidations.forgotPasswordSchema.safeParseAsync(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errors, resCode.BAD_REQUEST);
    }

    const { cus_email } = result.data;
    const customer = await customerQuery.getOne({ cus_email });

    if (!customer) {
      return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
    }

    const resetToken = authToken.generateRefreshAuthToken({
      user_id: customer._id,
      email: cus_email,
    });

    await customerAuthModel.findOneAndUpdate(
      { cus_id: customer._id },
      { cus_refresh_auth_token: resetToken },
      { upsert: true, new: true }
    );

    return responseHandler.success(res, msg.auth.resetTokenGenerated, {
      reset_token: resetToken,
    }, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed =await customerValidations.resetPasswordSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { reset_token, new_password } = parsed.data;

    const authEntry = await customerAuthQuery.getOne({ cus_refresh_auth_token: reset_token });

    if (!authEntry || !authEntry.cus_id) {
      return responseHandler.error(res, msg.auth.invalidResetToken, resCode.UNAUTHORIZED);
    }

    const hashedPassword = await hashPassword(new_password);
    await customerQuery.update({ _id: authEntry.cus_id }, { cus_password: hashedPassword });

    authEntry.cus_refresh_auth_token = "";
    await authEntry.save();

    return responseHandler.success(res, msg.auth.passwordResetSuccess, {}, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

export default {
  signupCustomer,
  signinCustomer,
  forgotPassword,
  resetPassword,
};
