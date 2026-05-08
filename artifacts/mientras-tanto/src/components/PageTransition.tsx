import React from "react";
import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full max-w-md mx-auto min-h-screen px-6 pt-12 pb-32 flex flex-col relative"
    >
      {children}
    </motion.div>
  );
}
