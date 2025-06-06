import { Request, Response, NextFunction } from "express";
import jobModel from "../models/job.model"; // ✅ Mongoose model
import { jobCreateSchema } from "../validations/job.validation";
import { resCode } from "../constants/resCode";
import { responseHandler } from "../services/responseHandler.service";
import mongoose from "mongoose";

export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Validate request with Zod
    const parsed = jobCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { job_sku } = parsed.data;

    // ✅ Manually check if job_sku already exists
    const existingJob = await jobModel.findOne({ job_sku });

    if (existingJob) {
      return responseHandler.error(
        res,
        `Job SKU '${job_sku}' already exists`,
        resCode.BAD_REQUEST
      );
    }

    // ✅ Create new job document
    const newJob = await jobModel.create(parsed.data);

    return responseHandler.success(
      res,
      "Job created successfully",
      newJob,
      resCode.CREATED
    );

  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return responseHandler.error(res, messages.join(", "), resCode.BAD_REQUEST);
    }

    return next(error); // fallback for unknown errors
  }
};

// ✅ Get all jobs
const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await jobModel.find();

    return responseHandler.success(
      res,
      "Jobs fetched successfully",
      jobs,
      resCode.OK
    );
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return responseHandler.error(res, messages.join(", "), resCode.BAD_REQUEST);
    }

    return next(error); // fallback for unknown errors
  }
};
export default {
  getAllJobs,
  createJob,
};
