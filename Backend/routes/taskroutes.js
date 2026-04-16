import express from "express";

import verifyJWT from "../middlewares/authmiddlewares.js";


import { createTask,getTasks, updateTask, deleteTask } from "../controllers/taskcontrollers.js";

const taskrouter = express.Router();

taskrouter.post("/create", verifyJWT, createTask);
taskrouter.get("/get", verifyJWT, getTasks);
taskrouter.patch("/update/:id", verifyJWT, updateTask);
taskrouter.delete("/delete/:id", verifyJWT, deleteTask);

export default taskrouter;