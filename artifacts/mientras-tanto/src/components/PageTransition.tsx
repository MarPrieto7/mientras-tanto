import React from "react";
import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      className="w-full max-w-lg mx-auto min-h-[100dvh] px-6 pt-12 pb-28 flex flex-col relative"
    >
      {children}
    </motion.div>
  );
}
