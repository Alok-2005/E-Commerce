import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectRoute =async (req, res, next) => {
  // next()  //it basically that it calls the next route i.e. it will call adminRoute and then adminRoute will ultimately call the getAllProducts route
  try {
    const accessToken=req.cookies.accessToken
    if(!accessToken){
        return res.status(401).json({message:"No access token provided"})
    }
    try {
        const decoded=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decoded.userID).select("-password")  //it says that it will find the user by its id but it will not give the password of the user

    if(!user){
        return res.status(401).json({message:"User not found"})
    }
// if another middleware or route needs the authenticated user's ID, email, or other properties, it can access them directly from req.user without having to retrieve the user from the database again.
// User information is attached to the request for use in the rest of the app.
    req.user=user


    // Calling next() here means that if the access token is valid and a user is found, the request will proceed to the next middleware function or the final route handler.
    next()
    } catch (error) {
        if(error.name==="TokenExpiredError"){
            return res.status(401).json({message:"Access token has expired"})
    }
    throw error
  }
 } catch (error) {
    console.log("Error in protecting route: ",error);
   return  res.status(401).json({message:"Invalid access token"})
  }
};


export const adminRoute=(req,res,next)=>{
    if(req.user && req.user.role==="admin"){
        next()
    }else{
        return res.status(403).json({message:"Access denied- Admin only"})
    }
}