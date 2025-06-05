import { z } from "zod";

const customerCreateSchema = z.object({
  cus_firstname: z
    .string()
    .max(50, "Maximum 50 characters allowed")
    .min(2, "minimum 2 characters allowed"), // Example: Requires at least 2 characters

  cus_lastname: z
    .string()
    .max(50, "Maximum 50 characters allowed")
    .min(2, "minimum 2 characters allowed"), // Example: Requires at least 2 characters
  cus_email: z.string().email(), // Example: Requires a valid email address
  cus_phone_number: z
    .string()
    .min(10, "Customer phone exactly 10 digits")
    .max(10, "Customer phone exactly 10 digits")
    .regex(/^\d+$/, "User phone must contain only digits"), // Example: Requires exactly 10 digits
  cus_password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]+$/,
      "Password validation with at least one digit, one lowercase, one uppercase, and one special character"
    ), // Password validation with at least one digit, one lowercase, one uppercase, and one special character
  cus_confirm_password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]+$/,
      "Password validation with at least one digit, one lowercase, one uppercase, and one special character"
    ), // Password validation with at least one digit, one lowercase, one uppercase, and one special character
});

const customerLoginSchema = z.object({
  email: z.string().email(), // Example: Requires a valid email address
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]+$/,
      "Password validation with at least one digit, one lowercase, one uppercase, and one special character"
    ), // Password validation with at least one digit, one lowercase, one uppercase, and one special character
});

// 



export const customerValidations = {
  customerCreateSchema,
  customerLoginSchema,
};
