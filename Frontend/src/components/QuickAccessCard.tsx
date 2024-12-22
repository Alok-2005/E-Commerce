import React from "react";
import { motion } from "framer-motion";

interface QuickAccessCardProps {
  title: string;
}

const QuickAccessCard = ({ title }: QuickAccessCardProps) => {
  return (
    <motion.div
      className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 
        hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 10px 20px rgba(52, 211, 153, 0.2)",
        borderColor: "rgba(52, 211, 153, 0.5)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <h3 className="text-xl font-semibold text-emerald-400 mb-2">{title}</h3>
      <p className="text-gray-400">
        Access your {title.toLowerCase()} and manage your application settings
      </p>
    </motion.div>
  );
};

export default QuickAccessCard;
