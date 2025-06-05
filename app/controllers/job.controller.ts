import { Request, Response, NextFunction } from "express";
import jobModel from "../models/job.model";
import { jobCreateSchema } from "../validations/job.validation";
import { ValidationError, UniqueConstraintError } from "sequelize";
import { resCode } from "../constants/resCode";
import { responseHandler } from "../services/responseHandler.service";

// Create a new job
const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = jobCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const newJob = await jobModel.create(parsed.data);

    return responseHandler.success(
      res,
      "Job created successfully",
      newJob,
      resCode.CREATED
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

    // 🔁 Forward any other unhandled error to the global error handler
    return next(error);
  }
};

// Get all jobs
const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await jobModel.findAll();

    return responseHandler.success(
      res,
      "Jobs fetched successfully",
      jobs,
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

    // 🔁 Forward any other unhandled error to the global error handler
    return next(error);
  }
};

export default {
  getAllJobs,
  createJob,
};
