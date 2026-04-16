import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./DB/db.js";
import cookieParser from "cookie-parser";
import authrouter from "./routes/authroutes.js";
import helmet from "helmet";
import taskrouter from "./routes/taskroutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authrouter);
app.use("/api/tasks", taskrouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});     
export default app;

