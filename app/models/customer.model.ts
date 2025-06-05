import mongoose, { Document, Schema } from "mongoose";

// TypeScript interface for the document
export interface ICustomer extends Document {
  cus_firstname: string;
  cus_lastname: string;
  cus_email: string;
  cus_phone_number: string;
  cus_password: string;
  reset_password_token?: string | null;
  reset_password_expires?: Date | null;
  cus_status: "active" | "inactive" | "restricted" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema definition
const CustomerSchema: Schema = new Schema<ICustomer>(
  {
    cus_firstname: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [30, "First name must be at most 30 characters"],
      trim: true,
    },
    cus_lastname: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [30, "Last name must be at most 30 characters"],
      trim: true,
    },
    cus_email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    cus_phone_number: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^[0-9]+$/, "Phone number must contain only numbers"],
      minlength: [10, "Phone number must be at least 10 digits"],
      maxlength: [15, "Phone number must be at most 15 digits"],
    },
    cus_password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    reset_password_token: {
      type: String,
      default: null,
    },
    reset_password_expires: {
      type: Date,
      default: null,
    },
    cus_status: {
      type: String,
      enum: ["active", "inactive", "restricted", "blocked"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "customers",
  }
);

// Export model
const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
export default Customer;
