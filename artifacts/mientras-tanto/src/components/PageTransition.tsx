import React from "react";
import { motion } from "framer-motion";

/**
 * WatercolorStrokes — authentic SVG brush-stroke shapes (NOT circles/blobs).
 * Each path models a real watercolor brush mark:
 *   - Tapered tips on both ends (like a brush lifting off the paper)
 *   - Wider middle section
 *   - Top and bottom edges have intentionally different curvatures
 *     so it looks hand-painted, not geometrically symmetric
 */

// Each stroke is a self-contained SVG with its own viewBox and path.
// Positioning and rotation are applied via Tailwind classes on the wrapper.

const strokes = [
  // ── 1. Sage green · long diagonal · top-right ──────────────────────────
  {
    viewBox: "0 0 500 70",
    fill: "hsl(95, 14%, 63%)",
    d: "M 3,35 C 18,20 62,12 138,17 C 212,21 282,13 362,19 C 428,23 468,29 497,35 C 469,46 429,54 364,51 C 284,58 213,60 138,55 C 63,52 19,48 3,35 Z",
    className: "absolute -top-3 -right-10 w-[290px] opacity-[0.11] dark:opacity-[0.07] rotate-[-8deg]",
  },

  // ── 2. Lavender · medium arc · bottom-left ────────────────────────────
  {
    viewBox: "0 0 420 65",
    fill: "hsl(277, 26%, 74%)",
    d: "M 3,32 C 22,16 68,9 145,15 C 222,20 295,11 368,18 C 400,22 415,27 417,32 C 416,42 400,50 370,47 C 296,54 223,56 146,50 C 70,46 23,42 3,32 Z",
    className: "absolute bottom-4 -left-6 w-[250px] opacity-[0.10] dark:opacity-[0.07] rotate-[6deg]",
  },

  // ── 3. Fog blue · short accent · right center ────────────────────────
  {
    viewBox: "0 0 300 55",
    fill: "hsl(200, 22%, 68%)",
    d: "M 3,27 C 18,12 55,6 115,12 C 175,17 220,10 270,15 C 288,18 297,22 297,27 C 297,34 289,40 271,43 C 221,48 175,50 115,46 C 56,44 19,38 3,27 Z",
    className: "absolute top-[42%] -right-4 w-[185px] opacity-[0.09] dark:opacity-[0.06] rotate-[-14deg]",
  },

  // ── 4. Sage · thin wispy stroke · top-left ───────────────────────────
  {
    viewBox: "0 0 360 40",
    fill: "hsl(95, 11%, 61%)",
    d: "M 2,20 C 18,11 58,7 125,11 C 192,14 258,8 318,12 C 340,14 353,17 358,20 C 354,24 341,28 319,27 C 259,30 192,32 125,28 C 59,26 19,24 2,20 Z",
    className: "absolute top-14 -left-2 w-[210px] opacity-[0.09] dark:opacity-[0.06] rotate-[11deg]",
  },

  // ── 5. Lavender · medium sweep · lower-right ────────────────────────
  {
    viewBox: "0 0 450 70",
    fill: "hsl(277, 25%, 76%)",
    d: "M 3,35 C 24,17 75,9 158,16 C 241,22 318,12 395,19 C 428,23 446,29 447,35 C 447,45 428,54 396,51 C 320,58 243,60 159,54 C 76,50 25,48 3,35 Z",
    className: "absolute bottom-28 right-2 w-[255px] opacity-[0.10] dark:opacity-[0.06] rotate-[-4deg]",
  },
] as const;

function WatercolorStrokes() {
  return (
    <div className="pointer-events-none select-none" aria-hidden>
      {strokes.map((s, i) => (
        <svg
          key={i}
          viewBox={s.viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className={s.className}
          style={{ overflow: "visible" }}
        >
          <path fill={s.fill} d={s.d} />
        </svg>
      ))}
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
      <WatercolorStrokes />
      {children}
    </motion.div>
  );
}
