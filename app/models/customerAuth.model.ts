import mongoose from "mongoose";

const customerAuthSchema = new mongoose.Schema(
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
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: "customerAuth",
  }
);

const customerAuthModel = mongoose.model("CustomerAuth", customerAuthSchema);

export default customerAuthModel;
