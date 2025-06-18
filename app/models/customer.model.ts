// import mongoose from "mongoose";

// const customerSchema = new mongoose.Schema(
//   {
//     cus_firstname: {
//       type: String,
//       required: [true, "First name is required"],
//       minlength: [2, "First name must be at least 2 characters"],
//       maxlength: [30, "First name must be at most 30 characters"],
//       trim: true,
//     },
//     cus_lastname: {
//       type: String,
//       required: [true, "Last name is required"],
//       minlength: [2, "Last name must be at least 2 characters"],
//       maxlength: [30, "Last name must be at most 30 characters"],
//       trim: true,
//     },
//     cus_email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
//     },
//     cus_phone_number: {
//       type: String,
//       required: [true, "Phone number is required"],
//       unique: true,
//       match: [/^[0-9]+$/, "Phone number must contain only numbers"],
//       minlength: [10, "Phone number must be at least 10 digits"],
//       maxlength: [15, "Phone number must be at most 15 digits"],
//     },
//     cus_password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [6, "Password must be at least 6 characters"],
//     },
  
//     cus_status: {
//       type: String,
//       enum: ["active", "inactive", "restricted", "blocked"],
//       default: "active",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//     collection: "customers",
//   }
// );

// const customerModel = mongoose.model("Customer", customerSchema);
// export default customerModel;


import mongoose from "mongoose";

// Counter Schema for auto-increment
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const counterModel = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// Customer Schema
const customerSchema = new mongoose.Schema(
  {
    cus_id: {
      type: Number,
      unique: true,
    },
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
      // ✅ Add this field to allow population
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
      },
    ],
    
  },
  
  {
    collection: "customer",
    timestamps: true,
  }
);

// Auto-increment cus_id before saving
customerSchema.pre("save", async function (next) {
  const doc = this as any;

  if (doc.isNew) {
    const counter = await counterModel.findByIdAndUpdate(
      { _id: "customerId" },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    doc.cus_id = counter.seq;
  }

  next();
});

const customerModel = mongoose.model("customer", customerSchema);
export default customerModel;
