import React from "react";
import { motion } from "framer-motion";

// Subtle watercolor-like blobs in the logo palette — sage, lavender, fog
// Very low opacity so they whisper rather than shout
function WatercolorAccents() {
  return (
    <div className="pointer-events-none select-none" aria-hidden>
      {/* Sage green — top right */}
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-16 -right-20 w-72 h-72 opacity-[0.045] dark:opacity-[0.035]"
      >
        <path
          fill="hsl(95, 11%, 68%)"
          d="M43.9,-57.2C56.7,-46.8,66.6,-33,71.1,-17.4C75.5,-1.7,74.3,15.8,66.8,30C59.2,44.2,45.2,55.1,29.8,62.5C14.4,69.9,-2.4,73.8,-17.8,69.6C-33.1,65.4,-47,53.2,-58.4,38.3C-69.8,23.4,-78.7,5.8,-77.7,-11.9C-76.7,-29.5,-65.8,-47.2,-51.2,-57.5C-36.6,-67.8,-18.3,-70.7,-0.8,-69.7C16.7,-68.6,31.1,-67.6,43.9,-57.2Z"
          transform="translate(200 200) scale(1.5)"
        />
      </svg>

      {/* Lavender — bottom left */}
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -bottom-24 -left-16 w-80 h-80 opacity-[0.04] dark:opacity-[0.03]"
      >
        <path
          fill="hsl(277, 28%, 79%)"
          d="M40.5,-51.2C52.8,-40.3,63,-27.1,65.2,-12.8C67.4,1.5,61.7,17,52.3,28.8C43,40.6,30.1,48.7,15.3,54.6C0.5,60.5,-16.2,64.2,-30,59.4C-43.8,54.6,-54.6,41.3,-61.1,25.5C-67.6,9.7,-69.7,-8.6,-64.2,-24C-58.7,-39.4,-45.5,-51.9,-31.1,-62C-16.7,-72.1,-1.2,-79.8,12.8,-78.1C26.8,-76.4,28.2,-62.1,40.5,-51.2Z"
          transform="translate(200 200) scale(1.6)"
        />
      </svg>

      {/* Fog blue — center right, very faint */}
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-1/3 -right-24 w-56 h-56 opacity-[0.03] dark:opacity-[0.025]"
      >
        <path
          fill="hsl(200, 22%, 71%)"
          d="M38.2,-48.7C50.5,-38.3,62.1,-27.4,66.5,-13.3C70.9,0.8,67.2,18.1,58.3,31.3C49.4,44.5,35.3,53.5,19.8,60.2C4.2,66.8,-12.8,71.1,-27.4,66.4C-42,61.7,-54.2,48,-62.7,31.7C-71.3,15.4,-76.3,-3.5,-72.3,-20.2C-68.3,-36.8,-55.3,-51.2,-40.6,-61.1C-25.8,-71,-9.3,-76.4,4.8,-81.9C18.9,-87.4,25.9,-59.1,38.2,-48.7Z"
          transform="translate(200 200) scale(1.3)"
        />
      </svg>
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      className="w-full max-w-lg mx-auto min-h-[100dvh] px-6 pt-12 pb-28 flex flex-col relative overflow-hidden"
    >
      <WatercolorAccents />
      {children}
    </motion.div>
  );
}
