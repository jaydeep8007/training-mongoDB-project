import { Request, Response, NextFunction } from "express";
import { authToken } from "../services/authToken.service";
import customerModel from "../models/customer.model";
import { responseHandler } from "../services/responseHandler.service";
import { msg } from "../constants/language/en.constant";
import { resCode } from "../constants/resCode";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authCustomer = async (req: Request, res: Response, next: NextFunction) => {
  authToken.verifyAuthToken(req, res, async () => {
    try {
      const decoded = (req as any).user;

      // ✅ Ensure decoded token has _id
      if (!decoded?._id) {
        return responseHandler.error(res, msg.common.unauthorized, resCode.UNAUTHORIZED);
      }

      const customer = await customerModel.findById(decoded._id);

      if (!customer) {
        return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
      }

      // ✅ Attach user info to req.user
      req.user = {
        _id: customer._id,
        cus_email: customer.cus_email,
        cus_firstname: customer.cus_firstname,
      };

      next();
    } catch (error) {
      console.error("authCustomer error:", error);
      return responseHandler.error(res, msg.common.serverError, resCode.SERVER_ERROR);
    }
  });
};

export default {
  authCustomer,
};
