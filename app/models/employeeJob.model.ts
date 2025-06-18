import mongoose from "mongoose";

const employeeJobSchema = new mongoose.Schema(
  {
    emp_id: {
      type: Number,
      required: true,
      ref: "employee",
    },
    job_id: {
      type: Number,
      required: true,
      ref: "job",
    },
  },
  {
    collection: "employeeJob",
    timestamps: true,
  }
);

const employeeJobModel = mongoose.model("employeeJob", employeeJobSchema);

export default employeeJobModel;
