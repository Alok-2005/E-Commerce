import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalytics } from "../controllers/analytics.controllers.js";
const router=express.Router()

router.get("/",protectRoute,adminRoute,getAnalytics)

export default router