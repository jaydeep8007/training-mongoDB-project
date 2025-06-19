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
import { get } from "../config/config";

const envConfig = get(process.env.NODE_ENV);
// Initialize common query methods for customer and customerAuth models
const customerQuery = commonQueryMongo(customerModel);
const customerAuthQuery = commonQueryMongo(customerAuthModel);

/* ============================================================================
 * 📝 Signup - Register New Customer
 * ============================================================================
 */
// const signupCustomer = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // ✅ Validate incoming data
//     const parsed = await customerValidations.customerCreateSchema.safeParseAsync(req.body);
//     if (!parsed.success) {
//       const errors = parsed.error.errors.map(err => `${err.path[0]}: ${err.message}`);
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

//     // ❌ Check if passwords match
//     if (cus_password !== cus_confirm_password) {
//       return responseHandler.error(res, msg.auth.passwordMismatch, resCode.BAD_REQUEST);
//     }

//     // ❌ Check for existing email or phone number
//     const existingCustomer = await customerQuery.getOne({
//       $or: [{ cus_email }, { cus_phone_number }],
//     });

//     if (existingCustomer) {
//       const conflicts = [];
//       if (existingCustomer.cus_email === cus_email) conflicts.push(msg.auth.emailExists);
//       if (existingCustomer.cus_phone_number === cus_phone_number) conflicts.push(msg.auth.phoneExists);

//       return responseHandler.error(res, conflicts.join(" "), resCode.BAD_REQUEST);
//     }

//     // 🔐 Hash password before saving
//     const hashedPassword = await hashPassword(cus_password);

//     // ✅ Create customer in DB
//     const newCustomer = await customerQuery.create({
//       cus_firstname,
//       cus_lastname,
//       cus_email,
//       cus_phone_number,
//       cus_password: hashedPassword,
//       cus_status: "active",
//     });

//     // 🔑 Generate access and refresh tokens
//     const token = authToken.generateAuthToken({ user_id: newCustomer._id, email: cus_email });
//     const refreshToken = authToken.generateRefreshAuthToken({ user_id: newCustomer._id, email: cus_email });

//     // ✅ Save tokens in customerAuth collection
//     await customerAuthQuery.create({
//       cus_id: newCustomer._id,
//       cus_auth_token: token,
//       cus_refresh_auth_token: refreshToken,
//     });

//   // ✅ Set refresh token as HTTP-only cookie
// res.cookie("refreshToken", refreshToken, {
//   httpOnly: true,
//   secure: true, // make false in localhost (optional)
//   sameSite: "strict",
//   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
// });

// // ✅ Return access token and customer details
// return responseHandler.success(res, msg.auth.signupSuccess, {
//   customer: newCustomer,
//   token, // access token only
// }, resCode.CREATED);
//   } catch (error) {
//     return next(error);
//   }
// };


const signupCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    

    // ✅ 1. Validate request body
    const parsed = await customerValidations.customerCreateSchema.safeParseAsync(req.body);
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

    // ❌ 2. Check password confirmation
    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(res, msg.auth.passwordMismatch, resCode.BAD_REQUEST);
    }

    // ❌ 3. Check for duplicate email/phone
    const existingCustomer = await customerQuery.getOne({
      $or: [{ cus_email }, { cus_phone_number }],
    });

    if (existingCustomer) {
      const conflicts = [];
      if (existingCustomer.cus_email === cus_email) conflicts.push(msg.auth.emailExists);
      if (existingCustomer.cus_phone_number === cus_phone_number) conflicts.push(msg.auth.phoneExists);

      return responseHandler.error(res, conflicts.join(" "), resCode.BAD_REQUEST);
    }

    // 🔐 4. Hash password
    const hashedPassword = await hashPassword(cus_password);

    // ✅ 5. Create new customer
    const newCustomer = await customerQuery.create({
      cus_firstname,
      cus_lastname,
      cus_email,
      cus_phone_number,
      cus_password: hashedPassword,
      cus_status: "active",
    });

    // 🔑 6. Generate access & refresh tokens
    const accessToken = authToken.generateAuthToken({
      user_id: newCustomer._id,
      email: cus_email,
    });

    const refreshToken = authToken.generateRefreshAuthToken({
      user_id: newCustomer._id,
      email: cus_email,
    });

    // ✅ 7. Save tokens in customer auth collection
    await customerAuthQuery.create({
      cus_id: newCustomer._id,
      cus_auth_token: accessToken ,
      cus_refresh_auth_token: refreshToken,
    });

    // 🍪 8. Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      ...envConfig.COOKIE_OPTIONS,
    });

    // 📤 9. Send access token in response (refresh token in cookie)
    return responseHandler.success(
      res,
      msg.auth.signupSuccess,
      {
        customer: newCustomer,
        accessToken , // access token
      },
      resCode.CREATED
    );
  } catch (error) {
    return next(error);
  }
};

/* ============================================================================
 * 🔐 Signin - Customer Login
 * ============================================================================
 */
// const signinCustomer = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // ✅ Validate login input
//     const parsed = await customerValidations.customerLoginSchema.safeParseAsync(req.body);
//     if (!parsed.success) {
//       const errors = parsed.error.errors.map(err => `${err.path[0]}: ${err.message}`);
//       return responseHandler.error(res, errors.join(", "), resCode.BAD_REQUEST);
//     }

//     const { cus_email, cus_password } = parsed.data;

//     // 🔍 Find customer by email
//     const customer = await customerQuery.getOne({ cus_email });

//     // ❌ No customer found
//     if (!customer) {
//       return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
//     }

//     // 🔐 Compare password
//     const isValid = await comparePasswords(cus_password, customer.cus_password);
//     if (!isValid) {
//       return responseHandler.error(res, msg.auth.invalidPassword, resCode.UNAUTHORIZED);
//     }

//     // 🔑 Generate tokens
//     const token = authToken.generateAuthToken({ user_id: customer._id, email: cus_email });
//     const refreshToken = authToken.generateRefreshAuthToken({ user_id: customer._id, email: cus_email });

//     // ✅ Save tokens
//     await customerAuthQuery.create({
//       cus_id: customer._id,
//       cus_auth_token: token,
//       cus_refresh_auth_token: refreshToken,
//     });

//     // 📤 Respond with login success
//     return responseHandler.success(res, msg.auth.loginSuccess, {
//       token,
//       refreshToken,
//       customer: {
//         cus_id: customer._id,
//         cus_firstname: customer.cus_firstname,
//         cus_lastname: customer.cus_lastname,
//         cus_email: customer.cus_email,
//         cus_phone_number: customer.cus_phone_number,
//       },
//     }, resCode.OK);
//   } catch (error) {
//     return next(error);
//   }
// };


const signinCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ✅ Validate login input
    const parsed = await customerValidations.customerLoginSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(err => `${err.path[0]}: ${err.message}`);
      return responseHandler.error(res, errors.join(", "), resCode.BAD_REQUEST);
    }

    const { cus_email, cus_password } = parsed.data;

    // 🔍 Find customer by email
    const customer = await customerQuery.getOne({ cus_email });

    if (!customer) {
      return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
    }

    // 🔐 Compare password
    const isValid = await comparePasswords(cus_password, customer.cus_password);
    if (!isValid) {
      return responseHandler.error(res, msg.auth.invalidPassword, resCode.UNAUTHORIZED);
    }

    // 🔑 Generate tokens
    const token = authToken.generateAuthToken({ user_id: customer._id, email: cus_email });
    const refreshToken = authToken.generateRefreshAuthToken({ user_id: customer._id, email: cus_email });

    // ✅ Save or update tokens in DB
    await customerAuthQuery.update(
      { cus_id: customer._id },
      {
        cus_id: customer._id,
        cus_auth_token: token,
        cus_refresh_auth_token: refreshToken,
      },
      { upsert: true }
    );

    // ✅ Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, envConfig.COOKIE_OPTIONS);

    // 📤 Send access token and customer info only
    return responseHandler.success(res, msg.auth.loginSuccess, {
      token, // access token
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

/* ============================================================================
 * 📧 Forgot Password - Request Reset Token
 * ============================================================================
 */
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ✅ Validate email input
    const result = await customerValidations.forgotPasswordSchema.safeParseAsync(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errors, resCode.BAD_REQUEST);
    }

    const { cus_email } = result.data;

    // 🔍 Find customer
    const customer = await customerQuery.getOne({ cus_email });
    if (!customer) {
      return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
    }

    // 🔑 Generate reset token
    const resetToken = authToken.generateRefreshAuthToken({
      user_id: customer._id,
      email: cus_email,
    });

    // 💾 Save reset token (upsert)
    await customerAuthModel.findOneAndUpdate(
      { cus_id: customer._id },
      { cus_refresh_auth_token: resetToken },
      { upsert: true, new: true }
    );

    // 📤 Send token in response
    return responseHandler.success(res, msg.auth.resetTokenGenerated, {
      reset_token: resetToken,
    }, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

/* ============================================================================
 * 🔁 Reset Password - Using Reset Token
 * ============================================================================
 */
const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ✅ Validate new password and token
    const parsed = await customerValidations.resetPasswordSchema.safeParseAsync(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { reset_token, new_password } = parsed.data;

    // 🔍 Find reset token entry
    const authEntry = await customerAuthQuery.getOne({ cus_refresh_auth_token: reset_token });

    // ❌ Invalid or expired token
    if (!authEntry || !authEntry.cus_id) {
      return responseHandler.error(res, msg.auth.invalidResetToken, resCode.UNAUTHORIZED);
    }

    // 🔐 Hash new password
    const hashedPassword = await hashPassword(new_password);

    // ✅ Update customer's password
    await customerQuery.update({ _id: authEntry.cus_id }, { cus_password: hashedPassword });

    // 🧹 Clear the reset token
    authEntry.cus_refresh_auth_token = "";
    await authEntry.save();

    // 📤 Success response
    return responseHandler.success(res, msg.auth.passwordResetSuccess, {}, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

/* ============================================================================
 * 🚪 Logout - Customer Logout
 * ============================================================================
 */
const logoutCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user?.cus_id) {
      return responseHandler.error(res, msg.common.unauthorized, resCode.UNAUTHORIZED);
    }

    // ❌ Optional: Delete stored tokens from DB
    await customerAuthQuery.delete({ where: { cus_id: user.cus_id } });

    // 🍪 Clear refresh token cookie
    res.clearCookie("refreshToken");

    return responseHandler.success(res, msg.auth.logoutSucces, {}, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

const getCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const cus_id = (req as any).user?.cus_id;


    if (!cus_id) {
      return responseHandler.error(res, "Unauthorized", resCode.UNAUTHORIZED);
    }

    // ✅ Use cus_id to find the customer
    const customer = await customerQuery.getOne({ cus_id });

    if (!customer) {
      return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
    }

    return responseHandler.success(res, msg.auth.profileFetchSuccess, { customer }, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

export default {
  signupCustomer,
  signinCustomer,
  forgotPassword,
  resetPassword,
  logoutCustomer,
  getCustomerProfile
};
