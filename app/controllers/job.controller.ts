// import { Request, Response, NextFunction } from "express";
// import jobModel from "../models/job.model";
// import { jobCreateSchema } from "../validations/job.validation";
// import { resCode } from "../constants/resCode";
// import { responseHandler } from "../services/responseHandler.service";

// // ✅ Create Job
// export const createJob = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // ✅ Validate request with Zod
//     const parsed = jobCreateSchema.safeParse(req.body);

//     if (!parsed.success) {
//       const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
//       return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
//     }

//     const { job_sku } = parsed.data;

//     // ✅ Manually check if job_sku already exists
//     const existingJob = await jobModel.findOne({ job_sku });

//     if (existingJob) {
//       return responseHandler.error(
//         res,
//         `Job SKU '${job_sku}' already exists`,
//         resCode.BAD_REQUEST
//       );
//     }

//     // ✅ Create new job document
//     const newJob = await jobModel.create(parsed.data);

//     return responseHandler.success(
//       res,
//       "Job created successfully",
//       newJob,
//       resCode.CREATED
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };

// // ✅ Get all jobs
// const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const jobs = await jobModel.find();

//     return responseHandler.success(
//       res,
//       "Jobs fetched successfully",
//       jobs,
//       resCode.OK
//     );
//   } catch (error: any) {
//     return next(error); // fallback for unknown errors
//   }
// };
// export default {
//   getAllJobs,
//   createJob,
// };

import { Request, Response, NextFunction } from "express";
import jobModel from "../models/job.model";
import { jobCreateSchema } from "../validations/job.validation";
import { resCode } from "../constants/resCode";
import { responseHandler } from "../services/responseHandler.service";
import { msg } from "../constants/language/en.constant";
import commonQueryMongo from "../services/comonQuery.service";

const jobQuery = commonQueryMongo(jobModel);

// ✅ Create Job
export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed =await jobCreateSchema.safeParseAsync(req.body);

    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map((err) => err.message).join(", ");
      return responseHandler.error(res, errorMsg, resCode.BAD_REQUEST);
    }

    const { job_sku } = parsed.data;

    const existingJob = await jobQuery.getOne({ job_sku });
    if (existingJob) {
      return responseHandler.error(
        res,
        msg.job.skuExists(job_sku),
        resCode.BAD_REQUEST
      );
    }

    const newJob = await jobQuery.create(parsed.data);

    return responseHandler.success(
      res,
      msg.job.createSuccess,
      newJob,
      resCode.CREATED
    );
  } catch (error) {
    return next(error);
  }
};
// 📄 Get All Jobs with Pagination via jobQuery.getAll
const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // Fetch paginated jobs
    const jobs = await jobQuery.getAll(
      {},                     // [optional filter object]
      { skip, limit }        // pagination options
    );

    // Fetch total count for pagination metadata
    const total = await jobModel.countDocuments({});  // same filter as above

    return responseHandler.success(
      res,
      msg.job.fetchSuccess,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),  // ensures full coverage
        jobs,
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
