import express from "express";
import {addToCart} from "../controllers/cart.controllers.js";
import {getCartProducts} from "../controllers/cart.controllers.js";
import {removeAllFromCart} from "../controllers/cart.controllers.js";
import {updateQuantity} from "../controllers/cart.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router=express.Router();

router.get("/",protectRoute,getCartProducts)
router.post("/",protectRoute,addToCart)
router.delete("/",protectRoute,removeAllFromCart)  
router.put("/:id",protectRoute,updateQuantity)  

export default router