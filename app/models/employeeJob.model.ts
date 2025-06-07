import mongoose from "mongoose";

const employeeJobSchema = new mongoose.Schema(
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

const employeeJobModel = mongoose.model("EmployeeJob", employeeJobSchema);

export default employeeJobModel;
