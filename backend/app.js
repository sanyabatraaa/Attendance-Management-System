import express from 'express';
import { config } from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { dbConnection } from './database/dbConnection.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import userRouter from "./router/userRouter.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fileUpload from 'express-fileupload';

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

const app = express();
config({ path: "./config/config.env" });

// CORS Configuration
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));



// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// File upload middleware
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

// Ensure uploads directory exists
const uploadDir = path.join(_dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(uploadDir));
// Routes
app.use("/api/v1/employee", userRouter);

// Database Connection
dbConnection();

// Error Middleware
app.use(errorMiddleware);

export default app;
