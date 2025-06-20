import { Request, Response, NextFunction } from "express";
import jobModel from "../models/job.model";
import { jobCreateSchema } from "../validations/job.validation";
import { resCode } from "../constants/resCode";
import { responseHandler } from "../services/responseHandler.service";
import { msg } from "../constants/language/en.constant";
import commonQueryMongo from "../services/comonQuery.service";

const jobQuery = commonQueryMongo(jobModel);

/* ============================================================================
 * 🛠️ Create New Job
 * ============================================================================
 */
export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Validate request body using Zod
    const parsed = await jobCreateSchema.safeParseAsync(req.body);

    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { job_sku } = parsed.data;

    // ❌ Check if job SKU already exists
    const existingJob = await jobQuery.getOne({ job_sku });
    if (existingJob) {
      return responseHandler.error(
        res,
        msg.job.skuExists(job_sku),
        resCode.BAD_REQUEST
      );
    }

    // ✅ Create new job
    const newJob = await jobQuery.create(parsed.data);

    return responseHandler.success(
      res,
      msg.job.createSuccess,
      newJob,
      resCode.CREATED
    );
  } catch (error) {
    return next(error); // ❌ fallback error
  }
};

/* ============================================================================
 * 📄 Get All Jobs (Paginated)
 * ============================================================================
 */
const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    // ✅ Use commonQuery to get jobs with pagination
    const result = await jobQuery.getAll({}, { page, limit });

    return responseHandler.success(
      res,
      msg.job.fetchSuccess,
      {
        ...result.pagination,
        jobs: result.data,
      },
      resCode.OK
    );
  } catch (error) {
    return next(error);
  }
};

export default {
  getAllJobs,
  createJob,
};
