import mongoose from "mongoose";

const EmployeeJobSchema = new mongoose.Schema(
  {
    emp_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Job",
    },
  },
  {
    collection: "employee_job",
    timestamps: true,
  }
);

// You generally don't need an auto-increment primary key in MongoDB; the _id field is sufficient.

const EmployeeJob = mongoose.model("EmployeeJob", EmployeeJobSchema);

export default EmployeeJob;
