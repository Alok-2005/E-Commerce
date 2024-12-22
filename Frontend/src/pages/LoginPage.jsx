import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import LoginForm from "./LoginForm";
import OtpForm from "./OtpForm";
const LoginPage = () => {
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [userId, setUserId] = useState(null);
  const { login, verifyOtp, loading } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const response = await login(email, password);
      
      if (response?.user?.role === "admin") {
        setUserId(response.user._id);
        setIsOtpStep(true);
        toast.success("OTP sent to your registered mobile number");
      } else {
        // toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed!");
    }
  };

  const handleOtpVerify = async (otp) => {
    try {
      await verifyOtp(userId, otp);
      toast.success("OTP verified successfully!");
      navigate("/");
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "OTP verification failed!");
    }
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h2 className="-mt-10 text-center text-3xl font-extrabold text-emerald-400">
          {isOtpStep ? "Verify OTP" : "Welcome back"}
        </h2>
      </motion.div>

      <motion.div
        className="mt-7 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isOtpStep ? (
            <OtpForm onSubmit={handleOtpVerify} loading={loading} />
          ) : (
            <LoginForm onSubmit={handleLogin} loading={loading} />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;