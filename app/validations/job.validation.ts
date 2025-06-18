import { z } from "zod";

export const jobCreateSchema = z
  .object({
    job_name: z
      .string()
      .min(2, "Job name must be at least 2 characters")
      .max(50, "Job name must be at most 50 characters")
      .trim(),

    job_sku: z
      .string()
      .min(1, "Job SKU is required")
      .max(20, "Job SKU must be at most 20 characters")
      .trim(),

    job_category: z
      .string()
      .min(2, "Job category must be at least 2 characters")
      .max(50, "Job category must be at most 50 characters")
      .trim(),
  }).strict()
  
  
