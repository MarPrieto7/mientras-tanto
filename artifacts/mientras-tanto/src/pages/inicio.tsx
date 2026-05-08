import { useState, useEffect, useRef } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { emotionProfiles, startAmbient, AmbientHandle } from "@/lib/ambient";
import logoUrl from "@/assets/logo.svg";

const phrases = [
  "No tienes que hacer nada rápido aquí.",
  "A veces sobrevivir al día ya es suficiente.",
  "Esto también pasará.",
  "Hoy no tienes que ser productivo.",
  "Mereces descansar sin culpa.",
  "Toma una respiración profunda.",
  "Está bien no saber qué hacer.",
  "Hoy ya hiciste suficiente.",
  "El silencio también es una forma de cuidarse."
];

export default function Inicio() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const handleRef = useRef<AmbientHandle | null>(null);
  const { theme, setTheme } = useTheme();

  // Rotate phrases slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const stopAudio = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    // Close and discard the context immediately so browser releases audio
    audioCtxRef.current = null;
    setIsPlaying(false);
  };

  const startAudio = () => {
    // Always create a fresh AudioContext
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    handleRef.current = startAmbient(ctx, emotionProfiles["neutral"]);
    setIsPlaying(true);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Stop audio when page is unmounted (e.g., navigating away)
  useEffect(() => {
    return () => {
      handleRef.current?.stop();
    };
  }, []);

  return (
    <PageTransition>
      {/* Top controls */}
      <div className="absolute top-5 right-5 flex gap-3 z-10">
        <button
          data-testid="button-toggle-theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 text-foreground-soft hover:text-foreground transition-colors duration-500"
          aria-label="Cambiar tema"
        >
          {theme === "dark"
            ? <Sun className="w-4 h-4" strokeWidth={1.5} />
            : <Moon className="w-4 h-4" strokeWidth={1.5} />}
        </button>
        <button
          data-testid="button-toggle-sound"
          onClick={toggleAudio}
          className="p-2 text-foreground-soft hover:text-foreground transition-colors duration-500"
          aria-label={isPlaying ? "Silenciar" : "Activar sonido ambiente"}
        >
          {isPlaying
            ? <Volume2 className="w-4 h-4" strokeWidth={1.5} />
            : <VolumeX className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        {/* Logo */}
        <motion.img
          src={logoUrl}
          alt="Mientras tanto"
          className="w-16 h-16 opacity-80"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* Rotating phrase */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={phraseIndex}
            className="text-3xl md:text-4xl font-serif text-center leading-relaxed text-foreground tracking-wide px-4 max-w-xs"
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          >
            {phrases[phraseIndex]}
          </motion.h1>
        </AnimatePresence>

        {/* App name — very subtle, below phrase */}
        <motion.p
          className="text-xs text-foreground-soft tracking-widest uppercase font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5, duration: 2 }}
        >
          mientras tanto
        </motion.p>
      </div>
    </PageTransition>
  );
}
