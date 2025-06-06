import { z } from "zod";

export const employeeCreateSchema = z.object({
  emp_name: z
    .string()
    .trim()
    .min(2, "Employee name must be at least 2 characters")
    .max(100, "Employee name must be at most 100 characters")
    .describe("Employee Name"),

  emp_email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform(email => email.toLowerCase())
    .describe("Employee Email"),

  emp_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .superRefine((val, ctx) => {
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one uppercase letter",
        });
      }
      if (!/[a-z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one lowercase letter",
        });
      }
      if (!/\d/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one number",
        });
      }
      if (!/[!@#$%^&*()_+]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one special character",
        });
      }
    })
    .describe("Employee Password"),

  emp_company_name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at most 100 characters")
    .describe("Company Name"),

  emp_mobile_number: z
    .string()
    .trim()
    .regex(/^\d+$/, "Mobile number must contain only digits")
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be at most 15 digits")
    .describe("Mobile Number"),

});
