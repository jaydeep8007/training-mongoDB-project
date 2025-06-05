import { Request, Response, NextFunction } from "express";
import customerModel from "../models/customer.model";
import customerAuthModel from "../models/customerAuth.model";
import { comparePasswords, hashPassword } from "../services/password.service";
import { authToken } from "../services/authToken.service";
import { responseHandler } from "../services/responseHandler.service";
import { resCode } from "../constants/resCode";
import { ValidationError } from "sequelize";
import { customerValidations } from "../validations/customer.validation";

const signupCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Zod validation using your schema
    const parsed = customerValidations.customerCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map(
        (err) => `${err.path[0]}: ${err.message}`
      );
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

    // ✅ Check password match after Zod validates individual fields
    if (cus_password !== cus_confirm_password) {
      return responseHandler.error(
        res,
        "Passwords do not match",
        resCode.BAD_REQUEST
      );
    }

    // ✅ Hash password
    const hashedPassword = await hashPassword(cus_password);

    // ✅ Create customer (confirm password not stored)
    const newCustomer = await customerModel.create({
      cus_firstname,
      cus_lastname,
      cus_email,
      cus_phone_number,
      cus_password: hashedPassword,
      cus_status: "active", // default
    });

    const customerData = newCustomer.get();

    // ✅ Generate tokens
    const token = authToken.generateAuthToken({
      user_id: customerData.cus_id,
      email: customerData.cus_email,
    });

    const refreshToken = authToken.generateRefreshAuthToken({
      user_id: customerData.cus_id,
      email: customerData.cus_email,
    });

    // ✅ Store tokens in auth table
    await customerAuthModel.create({
      cus_id: customerData.cus_id,
      cus_auth_token: token,
      cus_refresh_auth_token: refreshToken,
    });

    return responseHandler.success(
      res,
      "Customer created and signed up successfully",
      {
        customer: customerData,
        token,
        refreshToken,
      },
      resCode.CREATED
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

const signinCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Validate input with Zod
    const parsed = customerValidations.customerLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map(
        (err) => `${err.path[0]}: ${err.message}`
      );
      return responseHandler.error(res, errors.join(", "), resCode.BAD_REQUEST);
    }

    const { cus_email, cus_password } = parsed.data;

    // Validate input
    if (!cus_email || !cus_password) {
      return responseHandler.error(
        res,
        "Email and password are required",
        resCode.BAD_REQUEST
      );
    }

    // Find customer by email
    const customer = await customerModel.findOne({ where: { cus_email } });

    if (!customer) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    const customerData = customer.get();

    // Compare passwords
    const isValid = await comparePasswords(
      cus_password,
      customerData.cus_password
    );

    if (!isValid) {
      return responseHandler.error(
        res,
        "Invalid password",
        resCode.UNAUTHORIZED
      );
    }

    // Generate tokens
    const token = authToken.generateAuthToken({
      user_id: customerData.cus_id,
      email: customerData.cus_email,
    });

    const refreshToken = authToken.generateRefreshAuthToken({
      user_id: customerData.cus_id,
      email: customerData.cus_email,
    });

    // Save auth tokens in customer_auth table
    await customerAuthModel.create({
      cus_id: customerData.cus_id,
      cus_auth_token: token,
      cus_refresh_auth_token: refreshToken,
    });

    return responseHandler.success(
      res,
      "Login successful",
      {
        token,
        refreshToken,
        customer: {
          cus_id: customerData.cus_id,
          cus_firstname: customerData.cus_firstname,
          cus_lastname: customerData.cus_lastname,
          cus_email: customerData.cus_email,
          cus_phone_number: customerData.cus_phone_number,
        },
      },
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

    // For other unhandled errors
    return next(error);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = customerValidations.forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errors, resCode.BAD_REQUEST);
    }
    const { cus_email } = result.data;

    if (!cus_email) {
      return responseHandler.error(
        res,
        "Email is required",
        resCode.BAD_REQUEST
      );
    }

    // ✅ Find customer by email
    const customer = await customerModel.findOne({ where: { cus_email } });

    if (!customer) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    // ✅ Generate refresh token (reset token)
    const resetToken = authToken.generateRefreshAuthToken({
      user_id: customer.cus_id,
      email: customer.cus_email,
    });

    // ✅ Update or create entry in customerAuthModel
    const [authEntry, created] = await customerAuthModel.findOrCreate({
      where: { cus_id: customer.cus_id },
      defaults: {
        cus_auth_token: "", // keep empty or use real access token if needed
        cus_refresh_auth_token: resetToken,
      },
    });

    if (!created) {
      // Entry exists, update refresh token
      authEntry.set("cus_refresh_auth_token", resetToken);
      await authEntry.save();
    }

    // ✅ Success response
    return responseHandler.success(
      res,
      "Reset token has been generated successfully",
      { reset_token: resetToken },
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

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = customerValidations.resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(", ");
      return responseHandler.error(res, errors, resCode.BAD_REQUEST);
    }
    const { reset_token, new_password, confirm_password } = result.data;

    if (!reset_token || !new_password || !confirm_password) {
      return responseHandler.error(
        res,
        "All fields are required",
        resCode.BAD_REQUEST
      );
    }

    if (new_password !== confirm_password) {
      return responseHandler.error(
        res,
        "Passwords do not match",
        resCode.BAD_REQUEST
      );
    }

    // Find auth entry by token
    const authEntry = await customerAuthModel.findOne({
      where: { cus_refresh_auth_token: reset_token },
    });

    if (!authEntry) {
      return responseHandler.error(
        res,
        "Invalid or expired reset token",
        resCode.UNAUTHORIZED
      );
    }

    const testCust = await customerAuthModel.findOne({
      where: { cus_refresh_auth_token: reset_token }, // or any matching condition
      include: [
        {
          model: customerModel,
          as: "customer",
        },
      ],
    });

    // console.log("Customer found:", testCust);

    if (!testCust) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(new_password);

    // Update customer password
    const customerInstance = testCust.get("customer");
    if (!customerInstance) {
      return responseHandler.error(
        res,
        "Customer not found",
        resCode.NOT_FOUND
      );
    }
    // Cast to customerModel type to access set/save methods
    const customerModelInstance =
      customerInstance as typeof customerModel.prototype;
    customerModelInstance.set("cus_password", hashedPassword);
    customerModelInstance.set("reset_password_token", null); // Clear reset token

    await customerModelInstance.save();

    // Clear the reset token
    authEntry.set("cus_refresh_auth_token", "");
    await authEntry.save();

    return responseHandler.success(
      res,
      "Password has been reset successfully",
      {},
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
};
