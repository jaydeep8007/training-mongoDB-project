import mongoose from "mongoose";


const EmployeeSchema = new mongoose.Schema(
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
      // You can add a regex for email validation if you want
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
      // You can add validation here for length or pattern if needed
    },
  },
  {
    collection: "employee",
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", EmployeeSchema);

export default Employee;
