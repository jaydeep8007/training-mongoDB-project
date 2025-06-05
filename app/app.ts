import dotenv from "dotenv";
dotenv.config();

import express from "express";
import logger from "morgan";
import { get } from "./config/config";

import bodyParser from "body-parser";
import cors from "cors"; //For cross domain error
import timeout from "connect-timeout";
import session from "express-session";
import compress from "compression";
import cookieParser from "cookie-parser";

//db connections
import sequelize from "./config/sequelize";
import { connectMongo } from "./config/mongoose"; // <-- Addd this

const config = get(process.env.NODE_ENV);

/* MAIN ROUTES */
import router from "./routes/main.route";

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Middleware
// app.use(cors());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

app.use(express.json());
app.use(logger("dev"));
// if (config.NODE_ENV === 'development') {
//     app.use(logger('development'));
// } else if (config.NODE_ENV === 'production') {
//     app.use(compress({ threshold: 2 }));
// }

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
// app.use(logger('combined')); // Just uncomment this line to show logs.

/* =======   Settings for CORS ========== */
app.use((req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// app.use(timeout(120000));
app.use(haltOnTimedout);

function haltOnTimedout(req: any, res: any, next: any) {
  if (!req.timedout) next();
}

/* MAIN ROUTES FOR APP */
app.use("/", router);
// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    if (config.database.DB_TYPE === "mysql") {
      await sequelize.authenticate();
      console.log("✅ MySQL connected successfully.");
      await sequelize.sync();
      console.log("✅ MySQL models synced");
    } else if (config.database.DB_TYPE === "mongo") {
      await connectMongo();
    } else {
      throw new Error("❌ Unsupported DB_TYPE in config.");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
  console.log(`🚀 Server is running on port ${PORT}`);
});
