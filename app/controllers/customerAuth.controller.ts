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

    // 🔍 Find customer by email
    const customer = await customerQuery.getOne({ cus_email });
    if (!customer) {
      return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
    }

    // 🔑 Generate reset token using _id
    const resetToken = authToken.generateRefreshAuthToken({
      user_id: customer._id,
      email: cus_email,
    });

    // 💾 Save (or update) token in customerAuthModel using _id reference
    await customerAuthModel.findOneAndUpdate(
      { _id: customer._id }, // changed from cus_id
      { cus_auth_refresh_token: resetToken },
      { upsert: true, new: true }
    );

    // ✅ Send token in response
    return responseHandler.success(
      res,
      msg.auth.resetTokenGenerated,
      { reset_token: resetToken },
      resCode.OK
    );
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
    const authEntry = await customerAuthQuery.getOne({ cus_auth_refresh_token: reset_token });

    // ❌ Invalid or expired token
    if (!authEntry || !authEntry._id) {
      return responseHandler.error(res, msg.auth.invalidResetToken, resCode.UNAUTHORIZED);
    }

    // 🔐 Hash the new password
    const hashedPassword = await hashPassword(new_password);

    // ✅ Update customer's password using _id from auth entry
    await customerQuery.update({ _id: authEntry._id }, { cus_password: hashedPassword });

    // 🧹 Clear the reset token after password reset
    authEntry.cus_auth_refresh_token = "";
    await authEntry.save();

    // 📤 Send success response
    return responseHandler.success(
      res,
      msg.auth.passwordResetSuccess,
      {},
      resCode.OK
    );
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

    if (!user?._id) {
      return responseHandler.error(res, msg.common.unauthorized, resCode.UNAUTHORIZED);
    }

    // ❌ Delete auth entry for this user (logout effect)
    await customerAuthQuery.delete({ _id: user._id });

    // 🍪 Clear refresh token cookie
    res.clearCookie("refreshToken");

    return responseHandler.success(res, msg.auth.logoutSucces, {}, resCode.OK);
  } catch (error) {
    return next(error);
  }
};

const getCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = (req as any).user?._id;

    if (!customerId) {
      return responseHandler.error(res, msg.common.unauthorized, resCode.UNAUTHORIZED);
    }

    // ✅ Find customer by _id
    const customer = await customerQuery.getOne({ _id: customerId });

    if (!customer) {
      return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
    }

    return responseHandler.success(
      res,
      msg.auth.profileFetchSuccess,
      { customer },
      resCode.OK
    );
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
