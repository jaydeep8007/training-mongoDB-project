import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
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
  
    cus_status: {
      type: String,
      enum: ["active", "inactive", "restricted", "blocked"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "customers",
  }
);

const Customer = mongoose.model("Customer", CustomerSchema);
export default Customer;
