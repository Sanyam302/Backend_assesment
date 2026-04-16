import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";



 export const register= asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      throw new ApiError(400, "User already exists");
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user"
      
      
    });

   

    res
      .status(201)
      .json(new ApiResponse(201, {}, "User Registered"));
  });


 
  
  
