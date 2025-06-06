import mongoose from "mongoose";


const employeeSchema = new mongoose.Schema(
  {
    emp_name: {
      type: String,
      required: [true, "Employee name is required"],
    },
    emp_email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    emp_password: {
      type: String,
      required: [true, "Password is required"],
    },
    emp_company_name: {
      type: String,
      required: [true, "Company name is required"],
    },
    emp_mobile_number: {
      type: Number,  // use String for mobile numbers to preserve formatting and leading zeros
      required: [true, "Mobile number is required"],
      unique: true,
    },
  },
  {
    collection: "employees",
    timestamps: true,
  }
);

const employeeModel = mongoose.model("Employee", employeeSchema);

export default employeeModel;
