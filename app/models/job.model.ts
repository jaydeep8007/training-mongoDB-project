import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    job_name: {
      type: String,
      required: [true, "Job name is required"],
      maxlength: [50, "Job name cannot exceed 50 characters"],
      trim: true,
    },
    job_sku: {
      type: String,
      required: [true, "Job SKU is required"],
      maxlength: [20, "Job SKU cannot exceed 20 characters"],
      trim: true,
    },
    job_category: {
      type: String,
      required: [true, "Job category is required"],
      maxlength: [50, "Job category cannot exceed 50 characters"],
      trim: true,
    },
  },
  {
    collection: "job",
    timestamps: true,
  }
);

const Job = mongoose.model("Job", JobSchema);

export default Job;
