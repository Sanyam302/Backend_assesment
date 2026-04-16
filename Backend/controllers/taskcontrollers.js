import Task from "../models/Task.js";
import User from "../models/User.js";
import Redis from "../utils/redis.js";   
import { asyncHandler } from "../utils/asynchandler.js";

export   const createTask =asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = await Task.create({
    title,
    description,
    user: req.user._id, 
  });
  console.log("Task created:", task);

  res.status(201).json(task);
});

export const getTasks = asyncHandler(async (req, res) => {
  if(req.user.role === "admin"){
    const users = await User.find().select("-password");

  res.status(200).json(users);

  }
  else{
  
  const id= req.user._id.toString();
  const cached = await redis.get(`tasks:${id}`);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }
  const tasks = await Task.find({ user: req.user._id });
  await redis.setex(
    `tasks:${id}`,
    60,
    JSON.stringify(tasks)
  );

  res.status(200).json(tasks);
  console.log("Tasks fetched:", tasks);
}
});

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  task.title = title || task.title;
  task.description = description || task.description;
   await redis.del(`tasks:${req.user._id}`);
  await task.save();
 
  console.log("Task updated:", task);
  res.status(200).json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {

  if(req.user.role === "admin"){
    const { id } = req.params;
    const user= await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.remove();

    return res.status(200).json({ message: "User deleted successfully" });

  }
  

  
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
 await redis.del(`tasks:${req.user._id}`);
  await task.deleteOne();
  console.log("Task deleted:", task);
  res.status(200).json({ message: "Task deleted successfully" });
});