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
  // ✅ Reuse token verification from service
  authToken.verifyAuthToken(req, res, async () => {
    try {
        const decoded = (req as any).user;
console.log("Decoded token:", decoded);
      // You may use `_id` or `id` depending on your token payload
      const customer = await customerModel.findById(decoded.id); // or `decoded._id`

      if (!customer) {
        return responseHandler.error(res, msg.auth.customerNotFound, resCode.NOT_FOUND);
      }

      // ✅ Attach full customer info to req.user
      req.user = {
        _id: customer._id,
        cus_id: customer.cus_id,
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
