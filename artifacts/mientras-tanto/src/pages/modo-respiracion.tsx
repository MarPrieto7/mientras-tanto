import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { emotionProfiles, startAmbient, EmotionId } from "@/lib/ambient";

type BreathPhase = "inhala" | "sostén" | "exhala";

const phaseLabels: Record<BreathPhase, string> = {
  inhala: "Inhala",
  "sostén": "Sostén",
  exhala: "Exhala"
};

const phaseColors: Record<BreathPhase, string> = {
  inhala: "bg-fog/40",
  "sostén": "bg-lavender/40",
  exhala: "bg-sage/40"
};

export default function ModoRespiracion() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<BreathPhase>("inhala");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [started, setStarted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientHandleRef = useRef<{ stop: () => void } | null>(null);

  // Determine which emotional profile to use
  const savedEmotion = localStorage.getItem("mientras_tanto_emotion") as EmotionId | null;
  const emotionId: EmotionId = (savedEmotion && emotionProfiles[savedEmotion]) ? savedEmotion : "neutral";
  const profile = emotionProfiles[emotionId];
  const { inhale, hold, exhale } = profile.breathCycle;

  // Sequence: inhala → sostén → exhala → inhala...
  const phaseSequence: { phase: BreathPhase; duration: number }[] = [
    { phase: "inhala", duration: inhale },
    { phase: "sostén", duration: hold },
    { phase: "exhala", duration: exhale }
  ];

  const phaseIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runPhase = useCallback((index: number) => {
    const { phase: p, duration } = phaseSequence[index % phaseSequence.length];
    setPhase(p);
    setSecondsLeft(duration);

    const countdown = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(() => {
      clearInterval(countdown);
      phaseIndexRef.current = index + 1;
      runPhase(index + 1);
    }, duration * 1000);
  }, [inhale, hold, exhale]);

  const startSession = () => {
    setStarted(true);
    setIsActive(true);

    // Start ambient sound
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    ambientHandleRef.current = startAmbient(ctx, profile);

    phaseIndexRef.current = 0;
    runPhase(0);
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    ambientHandleRef.current?.stop();
    audioCtxRef.current?.close();
    setLocation("/como-me-siento");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ambientHandleRef.current?.stop();
    };
  }, []);

  // Scale values for breathing circle
  const circleScale = phase === "inhala" ? 1.6 : phase === "sostén" ? 1.6 : 1.0;
  const circleOpacity = phase === "sostén" ? 0.75 : phase === "inhala" ? 0.6 : 0.35;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        data-testid="button-close-respiration"
        className="absolute top-6 right-6 p-2 text-foreground-soft hover:text-foreground transition-colors duration-500"
      >
        <X className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Emotion label */}
      <motion.p
        className="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-foreground-soft tracking-widest uppercase font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5, duration: 1.5 }}
      >
        {profile.label}
      </motion.p>

      {!started ? (
        // Pre-start screen
        <motion.div
          className="flex flex-col items-center gap-12 px-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <div className="space-y-4">
            <h1 className="text-3xl font-serif text-foreground leading-relaxed">
              Modo Respiración
            </h1>
            <p className="text-foreground-soft text-sm leading-loose max-w-xs">
              Deja que la música y el movimiento guíen tu respiración.
              <br />
              Cierra los ojos cuando sientas que puedes.
            </p>
          </div>

          <div className="text-xs text-foreground-soft space-y-1 font-sans tracking-wide">
            <div>Inhala {inhale}s · {hold > 0 ? `Sostén ${hold}s · ` : ""}Exhala {exhale}s</div>
          </div>

          <button
            data-testid="button-start-respiration"
            onClick={startSession}
            className="px-10 py-3 rounded-full border border-foreground-soft/30 text-foreground-soft hover:text-foreground hover:border-foreground/40 transition-all duration-700 text-sm tracking-wide font-sans"
          >
            Comenzar
          </button>
        </motion.div>
      ) : (
        // Active breathing session
        <div className="flex flex-col items-center gap-8 w-full px-8">
          {/* Breathing circle */}
          <div className="relative flex items-center justify-center w-72 h-72">
            {/* Outer glow ring */}
            <motion.div
              className="absolute rounded-full bg-lavender/20"
              animate={{ scale: circleScale * 1.15, opacity: circleOpacity * 0.5 }}
              transition={{ duration: phase === "inhala" ? inhale : phase === "sostén" ? hold : exhale, ease: "easeInOut" }}
              style={{ width: 192, height: 192 }}
            />
            {/* Main circle */}
            <motion.div
              className={`absolute rounded-full ${phaseColors[phase]} backdrop-blur-sm`}
              animate={{ scale: circleScale, opacity: circleOpacity }}
              transition={{ duration: phase === "inhala" ? inhale : phase === "sostén" ? hold : exhale, ease: "easeInOut" }}
              style={{ width: 192, height: 192 }}
            />
            {/* Inner text */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phase}
                  className="font-serif text-2xl text-foreground"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.6 }}
                >
                  {phaseLabels[phase]}
                </motion.span>
              </AnimatePresence>
              <span className="font-sans text-xs text-foreground-soft tabular-nums">
                {secondsLeft}s
              </span>
            </div>
          </div>

          {/* Quiet reminder */}
          <motion.p
            className="text-xs text-foreground-soft text-center leading-loose max-w-xs font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 3, duration: 2 }}
          >
            No hay nada que hacer excepto respirar.
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}
