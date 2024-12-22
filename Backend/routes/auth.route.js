import express from "express";
import { signup,login,logout,refreshToken,getProfile,verifyAdminOTP } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router=express.Router();

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/refresh-token", refreshToken);
router.get("/profile",protectRoute,getProfile)
router.post("/verify-otp", verifyAdminOTP);
export default router