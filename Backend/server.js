import express from "express";
import path from "path";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __dirname=path.resolve()

app.use(express.json({limit:"10mb"}))   //this allows to pass request of the body...always keep it above the authroutes

app.use(cookieParser()) //this allows us to use cookies anywhere

app.use("/api/auth",authRoutes)
app.use("/api/products",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/coupons",couponRoutes)
app.use("/api/payments",paymentRoutes)
app.use("/api/analytics",analyticsRoutes)

if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"/Frontend/dist")))
  app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"Frontend","dist","index.html"))
  })
}


app.listen(PORT, () => {
  console.log(`Server is Running on port http://localhost:${PORT}`);
  connectDB()
});

// MsGleWC1CfzhvfJU
