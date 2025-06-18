// schemas/employeeCreateSchema.ts
import { z } from "zod";
import employeeModel from "../models/employee.model";

const validateStrongPassword = (val: string, ctx: z.RefinementCtx) => {
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
};

const employeeCreateSchema = z
  .object({
    emp_name: z
      .string()
      .min(2, "Employee name must be at least 2 characters")
      .max(100, "Employee name must be at most 100 characters"),

    emp_email: z
      .string()
      .email("Invalid email address")
      .transform((email) => email.toLowerCase()),

    emp_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .superRefine(validateStrongPassword),

    emp_company_name: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(100, "Company name must be at most 100 characters"),

    cus_id: z.number({
      required_error: "Customer ID is required",
      invalid_type_error: "Customer ID must be a number",
    }),

    emp_mobile_number: z
      .string()
      .min(10, "Mobile number must be equal or greater than 10 digits")
      .max(15, "Mobile number must be at most 15 digits")
      .regex(/^\d+$/, "Mobile number must contain only digits"),
  })
  .strict()
  .superRefine(async (data, ctx) => {
    // ✅ Check unique email
    const existingEmail = await employeeModel.findOne({
      where: { emp_email: data.emp_email },
    });
    if (existingEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email already exists",
        path: ["emp_email"],
      });
    }

    // ✅ Check unique mobile number
    const existingPhone = await employeeModel.findOne({
      where: { emp_mobile_number: data.emp_mobile_number },
    });
    if (existingPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile number already exists",
        path: ["emp_mobile_number"],
      });
    }
  });
const employeeUpdateSchema = z
  .object({
    emp_name: z.string().min(1, "Employee name is required").optional(),
    emp_email: z.string().email("Invalid email address").optional(),
    emp_password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    emp_company_name: z.string().min(1, "Company name is required").optional(),
    emp_mobile_number: z
      .string()
      .regex(/^\d{10}$/, "Mobile number must be 10 digits")
      .optional(),
    cus_id: z.number().int("Customer ID must be an integer").optional(),
  })
  .strict();

export default {
  employeeCreateSchema,
  validateStrongPassword,
  employeeUpdateSchema,
};
