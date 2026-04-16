import express from "express";
import  {register} from "../controllers/register.js";
import {login} from "../controllers/login.js";
import {logout} from "../controllers/login.js";
import getMe from "../controllers/me.js";
import verifyJWT from "../middlewares/authmiddlewares.js";
import { refreshToken } from "../controllers/login.js";


const authrouter = express.Router();

authrouter.post("/register", register);
authrouter.post("/login", login);
authrouter.get("/me", verifyJWT, getMe);
authrouter.post("/refresh-token", refreshToken);
authrouter.post("/logout", logout);


export default authrouter;