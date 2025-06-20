// validations/employee_job.validation.ts
import { z } from "zod";

const assignJobSchema = z.object({
  emp_id: z
    .string({
      required_error: "emp_id is required",
      invalid_type_error: "emp_id must be a string",
    })
    .min(1, "emp_id cannot be empty"), // make sure string is not empty
  job_id: z
    .string({
      required_error: "job_id is required",
      invalid_type_error: "job_id must be a string",
    })
    .min(1, "job_id cannot be empty"),
}).strict();

const assignMultipleJobsSchema = z.object({
  emp_ids: z
    .array(
      z
        .string({ invalid_type_error: "Each emp_id must be a number" })
        .min(1, "emp_id cannot be empty")
    )
    .nonempty("emp_ids array cannot be empty"),
  job_id: z
    .string({
      required_error: "job_id is required",
      invalid_type_error: "job_id must be a number",
    })
    .min(1, "job_id cannot be empty"),
}).strict();

export default {
  assignJobSchema,
  assignMultipleJobsSchema,
};
