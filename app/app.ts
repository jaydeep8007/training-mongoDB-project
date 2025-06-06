import dotenv from "dotenv";
dotenv.config();

import express from "express";
import logger from "morgan";
import { get } from "./config/config";

import cors from "cors";
import cookieParser from "cookie-parser";

import { connectMongo } from "./config/mongoose"; // MongoDB connection function

/* MAIN ROUTES */
import router from "./routes/main.route";

// Initialize Express application
const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(logger("dev"));

/* MAIN ROUTES FOR APP */
app.use("/api/v1", router);

// Server Start
const PORT = get(process.env.NODE_ENV).SERVER_PORT || 8000;

app.listen(PORT, async () => {
  try {
    await connectMongo();
    console.log("✅ MongoDB connected successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
  console.log(`🚀 Server is running on port ${PORT}`);
});
