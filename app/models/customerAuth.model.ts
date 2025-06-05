import mongoose from "mongoose";

const CustomerAuthSchema = new mongoose.Schema(
  {
    cus_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    cus_auth_token: {
      type: String,
      required: true,
    },
    cus_refresh_auth_token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: "customer_auth",
  }
);

const CustomerAuth = mongoose.model("CustomerAuth", CustomerAuthSchema);

export default CustomerAuth;
