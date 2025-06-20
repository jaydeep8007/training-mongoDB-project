import mongoose from "mongoose";

const employeeJobSchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Must be ObjectId
    required: true,
    ref: "employee",
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId, // ✅ Must be ObjectId
    required: true,
    ref: "job",
  },
}, {
  timestamps: true,
  collection: "employeejob", // 👈 Match this to your $lookup
});

const employeeJobModel = mongoose.model("employeeJob", employeeJobSchema);

export default employeeJobModel;
