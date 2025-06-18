// import mongoose from "mongoose";

// const employeeSchema = new mongoose.Schema(
//   {
//     emp_name: {
//       type: String,
//       required: [true, "Employee name is required"],
//     },
//     emp_email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       trim: true,
//       match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
//     },
//     emp_password: {
//       type: String,
//       required: [true, "Password is required"],
//     },
//     emp_company_name: {
//       type: String,
//       required: [true, "Company name is required"],
//     },
//     emp_mobile_number: {
//       type: Number,  // use String for mobile numbers to preserve formatting and leading zeros
//       required: [true, "Mobile number is required"],
//       unique: true,
//     },
//   },
//   {
//     collection: "employees",
//     timestamps: true,
//   }
// );

// const employeeModel = mongoose.model("Employee", employeeSchema);

// export default employeeModel;

import mongoose from "mongoose";

// Counter Schema for auto-increment
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

// Use existing Counter model if exists, otherwise create new
const counterModel =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// Employee Schema
const employeeSchema = new mongoose.Schema(
  {
    emp_id: {
      type: Number,
      unique: true,
    },
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
      type: String, // Use String to preserve formatting and leading zeros
      required: [true, "Mobile number is required"],
    },
    cus_id: {
      type: Number,
      ref: "customer", // 👈 should match your Customer model name
      required: [true, "Customer ID is required"],
    },
  },
  {
    collection: "employee",
    timestamps: true,
  }
);

employeeSchema.pre("save", async function (next) {
  const doc = this as any;

  if (doc.isNew) {
    const counter = await counterModel.findByIdAndUpdate(
      { _id: "employeeId" },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    doc.emp_id = counter.seq;
  }

  next();
});

const employeeModel =
  mongoose.models.Employee || mongoose.model("employee", employeeSchema);

export default employeeModel;
