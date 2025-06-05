import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors } = format;

// Define a custom format for logs
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    colorize(), // Adds color to logs (only useful in terminal)
    timestamp(), // Adds timestamp
    errors({ stack: true }), // Captures stack trace for errors
    logFormat // Applies custom format
  ),
  transports: [
    new transports.Console(), // Logs to console
    new transports.File({ filename: "logs/error.log", level: "error" }), // Logs errors to file
    new transports.File({ filename: "logs/combined.log" }), // Logs all messages
  ],
});

export default logger;
