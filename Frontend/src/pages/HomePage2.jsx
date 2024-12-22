import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { motion } from "framer-motion";
import QuickAccessGrid from "../components/QuickAccessGrid";
const HomePage2 = () => {
  const { user } = useUserStore();
  const isAdmin = user?.role === "admin";
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <motion.h1
        className="text-4xl font-bold mb-8 text-emerald-400 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Admin Dashboard
      </motion.h1>

      <motion.p
        className="text-2xl  text-gray-300 mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        Explore your dashboard and manage your application with powerful admin
        controls
      </motion.p>
      <p className="text-center text-xl text-gray-300 mb-12"></p>

      <motion.div
        className="w-[12%] mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {isAdmin && (
          <Link
            className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
                   transition duration-300 ease-in-out flex items-center"
            to={"/secret-dashboard"}
          >
            <Lock className="inline-block mr-1" size={18} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        )}
      </motion.div>

      <QuickAccessGrid />
    </div>
  );
};

export default HomePage2;
