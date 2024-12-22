import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";

import jwt from "jsonwebtoken";
dotenv.config();

import twilio from "twilio";


const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOTP = async (phoneNumber, otp) => {
  try {
    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`OTP sent to ${phoneNumber}`);
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw new Error("Failed to send OTP");
  }
};


const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const generateToken = (userID) => {
  const accessToken = jwt.sign({ userID }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userID }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// storing refresh token in redis
const storeRefreshToken = async (userID, refreshToken) => {
  // await redis.set(`refresh token:${userID}`,refreshToken,"Expires",7*24*60*60)  // 7 days
  await redis.set(
    `refresh_token:${userID}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 days
};

const setCookie = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    // Set the cookie to be "httpOnly".
    // This means the cookie cannot be accessed by JavaScript running in the browser,
    // which helps prevent XSS (Cross-Site Scripting) attacks.
    // reducing the risk of XSS attacks by preventing malicious scripts from reading the token.
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",
    // Ensures that the cookie is not sent along with cross-site requests.
    // Helps protect against CSRF (Cross-Site Request Forgery) attacks, as the cookie will only be included with requests made from the same site.
    // Setting this to "strict" means that the cookie will not be sent even if the user navigates to the site from an external link.
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, //This specifies how long the cookie will last before expiring, in milliseconds  ...15 min
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};



export const signup = async (req, res) => {
  // const {name,email,password,confirmPassword}=req.body
  const { name, email, password ,phone,countryCode} = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exist" });
    }
    // if(password!==confirmPassword){
    //     return res.status(400).json({message:"Passwords do not match"})
    // }

    const user = await User.create({ name, email, password,phone,countryCode , role: "customer"});

    // authenticate and generate token
    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);

    // setting cookie for both
    setCookie(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        countryCode: user.countryCode
        // password:user.password
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("email name role phone countryCode fullPhoneNumber password");

    if (user && (await user.comparePasswords(password))) {
      console.log("User at login:", user);
      if (user.role === "admin") {
        const otp = generateOTP();

        // Store OTP in Redis with 5-minute expiration
        await redis.set(`otp:${user._id}`, otp, "EX", 5 * 60);

        // Send OTP to the user's phone number
        await sendOTP(user.fullPhoneNumber, otp);
        
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookie(res, accessToken, refreshToken);

        return res.status(200).json({
          message: "OTP sent to your registered mobile number",
          user: { _id: user._id, email: user.email, role: user.role },
        });
      } else {
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookie(res, accessToken, refreshToken);

        return res.status(200).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          message: "Logged in successfully",
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error in logging in", error: error.message });
  }
};


export const verifyAdminOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "UserID and OTP are required" });
    }

    // Convert OTP to string for consistent comparison
    const submittedOTP = otp.toString();
    
    // Retrieve OTP from Redis
    const storedOTP = await redis.get(`otp:${userId}`);
    
    if (!storedOTP) {
      return res.status(400).json({ 
        message: "OTP has expired or is invalid",
        details: "Please request a new OTP"
      });
    }

    // Compare OTPs
    if (storedOTP !== submittedOTP) {
      return res.status(400).json({ 
        message: "Incorrect OTP",
        details: "The OTP you entered doesn't match our records"
      });
    }

    // Verify that the user exists and is an admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Unauthorized access",
        details: "Only admin users can verify OTP"
      });
    }

    // Generate tokens and log in the user
    const { accessToken, refreshToken } = generateToken(userId);
    await storeRefreshToken(userId, refreshToken);
    setCookie(res, accessToken, refreshToken);

    // Clear the OTP from Redis after successful verification
    await redis.del(`otp:${userId}`);

    res.status(200).json({ 
      message: "Logged in successfully as admin",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error in verifyAdminOTP:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};




export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh token:${decoded.userID}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
//   res.send("logout route called");
};


// here we will refresh the access token

export const refreshToken = async (req, res) => {
try {
    const refreshToken = req.cookies.refreshToken;  //we will use refresh token to refresh the access token
    if(!refreshToken){
        return res.status(401).json({message:"No refresh token provided"})
    }
    const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
    const storedToken=await redis.get(`refresh token:${decoded.userID}`)
    if(storedToken!==refreshToken){
        return res.status(401).json({message:"Refresh token has expired or is invalid"})
    }
    const accessToken=jwt.sign({userID:decoded.userID},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"})
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge:15 * 60 * 1000, // 15 days in milliseconds
      });
        
      res.json({message:"Access token refreshed successfully",accessToken})

} catch (error) {
    console.log("Error refreshing access token: ",error)
    res.status(500).json({message:"Server error",error:error.message})  
}
// Before refreshing the access token
// accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2NzJjYzg1OTYxMzE5YTkzZDdlNGVmYzYiLCJpYXQiOjE3MzA5OTk4NjksImV4cCI6MTczMTAwMDc2OX0.EsrGkgILs3n_X0iqBA3j2VVzHsunOXMbtcw5SSWqyDA; Path=/; HttpOnly; Expires=Thu, 07 Nov 2024 17:32:49 GMT;


// After refreshing the access token
// accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2NzJjYzg1OTYxMzE5YTkzZDdlNGVmYzYiLCJpYXQiOjE3MzA5OTk5MzYsImV4cCI6MTczMTAwMDgzNn0.Wu3_ibV2GFARqJqewVXOaayuV5aKxEft5BgM4xq75_0; Path=/; HttpOnly; Expires=Thu, 07 Nov 2024 17:33:56 GMT;
}

export const getProfile = async (req, res) => {

try {
  return res.json(req.user)
} catch (error) {
  res.status(500).json({ message: "Server error", error: error.message });
}
}
