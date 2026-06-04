import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Volume1, VolumeX, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useMusic, VolumeMode } from "@/contexts/MusicContext";
import logoUrl from "@assets/Logo_Mientras_tanto_1780576362543.png";

const phrases = [
  "No tienes que hacer nada rápido aquí.",
  "A veces sobrevivir al día ya es suficiente.",
  "Esto también pasará.",
  "Hoy no tienes que ser productivo.",
  "Mereces descansar sin culpa.",
  "Toma una respiración profunda.",
  "Está bien no saber qué hacer.",
  "Hoy ya hiciste suficiente.",
  "El silencio también es una forma de cuidarse.",
  "Tu ritmo es válido.",
];

const volumeIcons: Record<VolumeMode, React.ReactNode> = {
  normal: <Volume2 className="w-4 h-4" strokeWidth={1.5} />,
  soft:   <Volume1 className="w-4 h-4" strokeWidth={1.5} />,
  off:    <VolumeX className="w-4 h-4" strokeWidth={1.5} />,
};

const volumeLabels: Record<VolumeMode, string> = {
  normal: "Sonido activado",
  soft:   "Sonido suave",
  off:    "Silencio",
};

export default function Inicio() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const { theme, setTheme, isAutoMode } = useTheme();
  const { volumeMode, cycleVolume } = useMusic();

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const isNight = new Date().getHours() >= 20 || new Date().getHours() < 7;

  return (
    <PageTransition>
      {/* Top controls */}
      <div className="absolute top-5 right-5 flex items-center gap-2 z-10">

        {/* Volume cycle button */}
        <button
          onClick={cycleVolume}
          className="p-2 text-foreground-soft hover:text-foreground transition-colors duration-500"
          aria-label={volumeLabels[volumeMode]}
          title={volumeLabels[volumeMode]}
        >
          {volumeIcons[volumeMode]}
        </button>

        {/* Aesthetic pill theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Cambiar a modo ${theme === "dark" ? "día" : "noche"}`}
          title={isAutoMode
            ? `Tema automático (${isNight ? "noche" : "día"})`
            : `Modo ${theme}`}
          className={`
            relative flex items-center w-12 h-6 rounded-full border
            transition-all duration-700 overflow-hidden
            ${theme === "dark"
              ? "bg-background-secondary border-lavender/20 shadow-[0_0_10px_rgba(202,184,220,0.15)]"
              : "bg-background-secondary/60 border-background-secondary"
            }
          `}
        >
          {/* Sliding dot */}
          <motion.div
            animate={{ x: theme === "dark" ? 22 : 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              absolute w-5 h-5 rounded-full flex items-center justify-center
              transition-colors duration-700
              ${theme === "dark" ? "bg-lavender/70" : "bg-sage/70"}
            `}
          >
            {theme === "dark"
              ? <Moon className="w-2.5 h-2.5 text-background" strokeWidth={2} />
              : <Sun  className="w-2.5 h-2.5 text-background" strokeWidth={2} />
            }
          </motion.div>
          <span className="sr-only">
            {theme === "dark" ? "Modo noche" : "Modo día"}
          </span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10">

        {/* Logo — clipped to circle so no white corners in dark mode */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className={`
            rounded-full overflow-hidden transition-all duration-700
            ${theme === "dark"
              ? "ring-1 ring-lavender/15 shadow-[0_0_40px_rgba(202,184,220,0.10)]"
              : ""
            }
          `}
        >
          <img
            src={logoUrl}
            alt="Mientras tanto — tu refugio emocional"
            className="w-36 h-36 object-cover"
          />
        </motion.div>

        {/* Rotating phrase */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={phraseIndex}
            className="text-3xl md:text-4xl font-serif text-center leading-relaxed text-foreground tracking-wide px-6 max-w-sm"
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          >
            {phrases[phraseIndex]}
          </motion.h1>
        </AnimatePresence>

        {/* Auto-mode hint */}
        {isAutoMode && (
          <motion.p
            className="text-[10px] text-foreground-soft/35 tracking-widest uppercase font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 2 }}
          >
            {isNight ? "modo noche" : "modo día"} · automático
          </motion.p>
        )}
      </div>
    </PageTransition>
  );
}
