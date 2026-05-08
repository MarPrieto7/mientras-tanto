import { useState, useEffect, useRef } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const phrases = [
  "No tienes que hacer nada rápido aquí.",
  "A veces sobrevivir al día ya es suficiente.",
  "Esto también pasará.",
  "Hoy no tienes que ser productivo.",
  "Mereces descansar sin culpa.",
  "Toma una respiración profunda.",
  "Está bien no saber qué hacer."
];

export default function Inicio() {
  const [phrase, setPhrase] = useState(phrases[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setPhrase(prev => {
        const currentIndex = phrases.indexOf(prev);
        return phrases[(currentIndex + 1) % phrases.length];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current!.currentTime, 1);
        setTimeout(() => {
          oscillatorRef.current?.stop();
          oscillatorRef.current?.disconnect();
          audioContextRef.current?.close();
        }, 1000);
      }
      setIsPlaying(false);
    } else {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
      
      // Soft modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setTargetAtTime(0.1, ctx.currentTime, 2); // Slow fade in
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setIsPlaying(true);
    }
  };

  return (
    <PageTransition>
      <div className="absolute top-4 right-0 flex gap-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-foreground-soft hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={toggleAudio}
          className="p-2 text-foreground-soft hover:text-foreground transition-colors"
        >
          {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.h1 
          className="text-4xl md:text-5xl font-serif text-center leading-relaxed text-foreground tracking-wide px-4"
          key={phrase}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        >
          {phrase}
        </motion.h1>
      </div>
    </PageTransition>
  );
}
