import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useMusic } from "@/contexts/MusicContext";
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
  "Tu ritmo es válido."
];

export default function Inicio() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const { theme, setTheme, isAutoMode } = useTheme();
  const { isGlobalPlaying, toggleGlobal } = useMusic();

  // Rotate phrases slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition>
      {/* Top controls */}
      <div className="absolute top-5 right-5 flex gap-2 z-10">
        <button
          data-testid="button-toggle-theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 text-foreground-soft hover:text-foreground transition-colors duration-500"
          aria-label={isAutoMode ? "Modo automático activo — cambiar tema" : "Cambiar tema"}
          title={isAutoMode ? "Tema automático según la hora" : `Tema ${theme}`}
        >
          {theme === "dark"
            ? <Sun className="w-4 h-4" strokeWidth={1.5} />
            : <Moon className="w-4 h-4" strokeWidth={1.5} />}
        </button>
        <button
          data-testid="button-toggle-sound"
          onClick={toggleGlobal}
          className="p-2 text-foreground-soft hover:text-foreground transition-colors duration-500"
          aria-label={isGlobalPlaying ? "Silenciar música" : "Activar música ambiente"}
          title={isGlobalPlaying ? "Silenciar música" : "Activar música ambiente"}
        >
          {isGlobalPlaying
            ? <Volume2 className="w-4 h-4" strokeWidth={1.5} />
            : <VolumeX className="w-4 h-4" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        {/* Logo */}
        <motion.img
          src={logoUrl}
          alt="Mientras tanto — tu refugio emocional"
          className="w-36 h-36 object-contain"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />

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

        {/* Auto dark mode hint */}
        {isAutoMode && (
          <motion.p
            className="text-[10px] text-foreground-soft/40 tracking-widest uppercase font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 2 }}
          >
            tema automático · {new Date().getHours() >= 20 || new Date().getHours() < 7 ? "modo noche" : "modo día"}
          </motion.p>
        )}
      </div>
    </PageTransition>
  );
}
