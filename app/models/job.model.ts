// import mongoose from "mongoose";

// const jobSchema = new mongoose.Schema(
//   {
//     job_name: {
//       type: String,
//       required: [true, "Job name is required"],
//       maxlength: [50, "Job name cannot exceed 50 characters"],
//       trim: true,
//     },
//     job_sku: {
//       type: String,
//       unique: true,
//       required: [true, "Job SKU is required"],
//       maxlength: [20, "Job SKU cannot exceed 20 characters"],
//       trim: true,
//     },
//     job_category: {
//       type: String,
//       required: [true, "Job category is required"],
//       maxlength: [50, "Job category cannot exceed 50 characters"],
//       trim: true,
//     },
//   },
//   {
//     collection: "job",
//     timestamps: true,
//   }
// );

// const jobModel = mongoose.model("Job", jobSchema);

// export default jobModel;

import mongoose from "mongoose";

// Counter schema and model for auto-increment
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

// Reuse existing Counter model or create new
const counterModel = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// Job Schema
const jobSchema = new mongoose.Schema(
  {
    job_id: {
      type: Number,
      unique: true,
    },
    job_name: {
      type: String,
      required: [true, "Job name is required"],
      maxlength: [50, "Job name cannot exceed 50 characters"],
      trim: true,
    },
    job_sku: {
      type: String,
      unique: true,
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

// Pre-save hook to auto-increment job_id
jobSchema.pre("save", async function (next) {
  const doc = this as any;

  if (doc.isNew) {
    const counter = await counterModel.findByIdAndUpdate(
      { _id: "jobId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    doc.job_id = counter.seq;
  }

  next();
});

// Reuse existing Job model or create new
const jobModel = mongoose.models.Job || mongoose.model("job", jobSchema);

export default jobModel;
