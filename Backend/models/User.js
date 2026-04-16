import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name:{
      type: String,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      match: [
        /^(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one capital letter and one number",
      ],
    },
    refreshToken: {
      type: String,
    },
    role:{
      type: String,
      enum: ["user", "admin"],
      default: "user",
    }

});
const User = mongoose.model("User", UserSchema);

export default User;