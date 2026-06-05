import React from "react";
import { motion } from "framer-motion";

/**
 * BotanicalAccents — delicate SVG decorations inspired by the logo:
 *   - Thin botanical branches with small oval leaves (like olive branches)
 *   - A faint mountain ridgeline silhouette
 * All stroke-based, no solid fills. Very subtle opacity (8–14%).
 */
function BotanicalAccents() {
  const sage     = "hsl(95, 13%, 52%)";
  const lavender = "hsl(277, 20%, 67%)";
  const fog      = "hsl(200, 18%, 62%)";

  return (
    <div className="pointer-events-none select-none" aria-hidden>

      {/* ── Branch 1 · tall · right side · sage ─────────────────────── */}
      <svg viewBox="0 0 60 250" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="absolute -top-2 right-5 w-11 h-52 opacity-[0.13] dark:opacity-[0.08]">
        {/* Stem */}
        <path stroke={sage} strokeWidth="0.85" strokeLinecap="round"
          d="M 30,248 C 28,205 32,168 29,112 C 27,70 31,35 30,2" />
        {/* Leaf pairs — alternating left / right */}
        <ellipse cx="43" cy="58"  rx="12" ry="4.5" fill={sage} opacity="0.7" transform="rotate(-42 43 58)" />
        <ellipse cx="17" cy="74"  rx="12" ry="4.5" fill={sage} opacity="0.7" transform="rotate(42 17 74)" />
        <ellipse cx="44" cy="102" rx="12" ry="4.5" fill={sage} opacity="0.7" transform="rotate(-40 44 102)" />
        <ellipse cx="16" cy="118" rx="12" ry="4.5" fill={sage} opacity="0.7" transform="rotate(40 16 118)" />
        <ellipse cx="43" cy="144" rx="11" ry="4"   fill={sage} opacity="0.7" transform="rotate(-37 43 144)" />
        <ellipse cx="17" cy="158" rx="11" ry="4"   fill={sage} opacity="0.7" transform="rotate(37 17 158)" />
        <ellipse cx="42" cy="186" rx="10" ry="3.5" fill={sage} opacity="0.7" transform="rotate(-34 42 186)" />
        <ellipse cx="18" cy="200" rx="10" ry="3.5" fill={sage} opacity="0.7" transform="rotate(34 18 200)" />
      </svg>

      {/* ── Branch 2 · medium · bottom-left · lavender ──────────────── */}
      <svg viewBox="0 0 55 195" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-10 left-4 w-10 h-36 opacity-[0.12] dark:opacity-[0.07] rotate-[10deg]">
        <path stroke={lavender} strokeWidth="0.85" strokeLinecap="round"
          d="M 28,193 C 26,160 30,130 27,82 C 25,50 29,22 28,2" />
        <ellipse cx="41" cy="50"  rx="11" ry="4"   fill={lavender} opacity="0.7" transform="rotate(-40 41 50)" />
        <ellipse cx="15" cy="64"  rx="11" ry="4"   fill={lavender} opacity="0.7" transform="rotate(40 15 64)" />
        <ellipse cx="41" cy="94"  rx="11" ry="4"   fill={lavender} opacity="0.7" transform="rotate(-38 41 94)" />
        <ellipse cx="15" cy="108" rx="11" ry="4"   fill={lavender} opacity="0.7" transform="rotate(38 15 108)" />
        <ellipse cx="40" cy="134" rx="10" ry="3.5" fill={lavender} opacity="0.7" transform="rotate(-35 40 134)" />
        <ellipse cx="16" cy="147" rx="10" ry="3.5" fill={lavender} opacity="0.7" transform="rotate(35 16 147)" />
      </svg>

      {/* ── Branch 3 · small accent · top-left · fog blue ───────────── */}
      <svg viewBox="0 0 48 160" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="absolute top-14 left-5 w-9 h-28 opacity-[0.10] dark:opacity-[0.06] rotate-[-8deg]">
        <path stroke={fog} strokeWidth="0.8" strokeLinecap="round"
          d="M 24,158 C 22,128 26,100 23,58 C 22,34 25,14 24,2" />
        <ellipse cx="36" cy="34"  rx="10" ry="3.5" fill={fog} opacity="0.7" transform="rotate(-38 36 34)" />
        <ellipse cx="12" cy="46"  rx="10" ry="3.5" fill={fog} opacity="0.7" transform="rotate(38 12 46)" />
        <ellipse cx="36" cy="74"  rx="10" ry="3.5" fill={fog} opacity="0.7" transform="rotate(-36 36 74)" />
        <ellipse cx="12" cy="86"  rx="10" ry="3.5" fill={fog} opacity="0.7" transform="rotate(36 12 86)" />
        <ellipse cx="35" cy="112" rx="9"  ry="3"   fill={fog} opacity="0.7" transform="rotate(-33 35 112)" />
        <ellipse cx="13" cy="123" rx="9"  ry="3"   fill={fog} opacity="0.7" transform="rotate(33 13 123)" />
      </svg>

      {/* ── Mountain ridgeline · bottom · very faint ─────────────────── */}
      <svg viewBox="0 0 340 58" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-24 left-1/2 -translate-x-1/2 w-72 opacity-[0.07] dark:opacity-[0.05]">
        <path stroke={fog} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round"
          d="M 0,58 L 52,20 L 82,33 L 128,5 L 172,28 L 214,13 L 258,40 L 292,22 L 340,58" />
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
      <BotanicalAccents />
      {children}
    </motion.div>
  );
}
