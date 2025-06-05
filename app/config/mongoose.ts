import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectMongo = async () => {
  try {
    const mongoURI = process.env.MONGO_URI; // Correct key
    if (!mongoURI) throw new Error("Mongo URI not found in environment variables.");

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
};
