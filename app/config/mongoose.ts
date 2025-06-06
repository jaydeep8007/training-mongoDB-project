import mongoose from "mongoose";
import dotenv from "dotenv";
import { get } from "./config"; // adjust the path if needed
dotenv.config();

export const connectMongo = async () => {
  try {
    const config = get(process.env.NODE_ENV); // get config based on env
    const mongoURI = config.database.MONGO_URI;

    if (!mongoURI) throw new Error("Mongo URI not found in config.");

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
};
