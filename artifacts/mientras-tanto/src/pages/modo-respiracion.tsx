import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { emotionProfiles, startAmbient, AmbientHandle, EmotionId } from "@/lib/ambient";

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
  const [started, setStarted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const handleRef = useRef<AmbientHandle | null>(null);
  const phaseIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine emotional profile from localStorage
  const savedEmotion = localStorage.getItem("mientras_tanto_emotion") as EmotionId | null;
  const emotionId: EmotionId = savedEmotion && emotionProfiles[savedEmotion] ? savedEmotion : "neutral";
  const profile = emotionProfiles[emotionId];
  const { inhale, hold, exhale } = profile.breathCycle;

  const phaseSequence: { phase: BreathPhase; duration: number }[] = [
    { phase: "inhala", duration: inhale },
    { phase: "sostén", duration: hold },
    { phase: "exhala", duration: exhale }
  ];

  const runPhase = useCallback((index: number) => {
    const { phase: p, duration } = phaseSequence[index % phaseSequence.length];
    setPhase(p);
    setSecondsLeft(duration);

    // Clear any previous countdown
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(() => {
      clearInterval(countdownRef.current!);
      const next = index + 1;
      phaseIndexRef.current = next;
      runPhase(next);
    }, duration * 1000);
  }, [inhale, hold, exhale]);

  const stopAudio = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    audioCtxRef.current = null;
  };

  const startSession = () => {
    setStarted(true);

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;
    handleRef.current = startAmbient(ctx, profile);

    phaseIndexRef.current = 0;
    runPhase(0);
  };

  const handleClose = () => {
    // Stop all timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    // Stop audio (fades out then closes AudioContext)
    stopAudio();
    setLocation("/como-me-siento");
  };

  // Cleanup if component unmounts for any reason
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      handleRef.current?.stop();
    };
  }, []);

  const phaseDuration = phase === "inhala" ? inhale : phase === "sostén" ? hold : exhale;
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
      {/* Close */}
      <button
        onClick={handleClose}
        data-testid="button-close-respiration"
        className="absolute top-6 right-6 p-2 text-foreground-soft hover:text-foreground transition-colors duration-500"
        aria-label="Cerrar"
      >
        <X className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Sound label — very subtle */}
      <motion.p
        className="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-foreground-soft tracking-widest uppercase font-sans whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.8, duration: 1.5 }}
      >
        {profile.label}
      </motion.p>

      {!started ? (
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
            <p className="text-foreground-soft text-sm leading-loose max-w-xs font-sans">
              El sonido y el movimiento guiarán tu respiración.
              <br />
              Cierra los ojos cuando puedas.
            </p>
          </div>

          <p className="text-xs text-foreground-soft font-sans tracking-wide">
            Inhala {inhale}s
            {hold > 0 ? ` · Sostén ${hold}s` : ""}
            {` · Exhala ${exhale}s`}
          </p>

          <button
            data-testid="button-start-respiration"
            onClick={startSession}
            className="px-10 py-3 rounded-full border border-foreground-soft/30 text-foreground-soft hover:text-foreground hover:border-foreground/40 transition-all duration-700 text-sm tracking-wide font-sans"
          >
            Comenzar
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-8 w-full px-8">
          {/* Breathing circle */}
          <div className="relative flex items-center justify-center w-72 h-72">
            {/* Outer glow */}
            <motion.div
              className="absolute rounded-full bg-lavender/15"
              animate={{ scale: circleScale * 1.18, opacity: circleOpacity * 0.45 }}
              transition={{ duration: phaseDuration, ease: "easeInOut" }}
              style={{ width: 200, height: 200 }}
            />
            {/* Main circle */}
            <motion.div
              className={`absolute rounded-full ${phaseColors[phase]}`}
              animate={{ scale: circleScale, opacity: circleOpacity }}
              transition={{ duration: phaseDuration, ease: "easeInOut" }}
              style={{ width: 200, height: 200 }}
            />
            {/* Phase text */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phase}
                  className="font-serif text-2xl text-foreground"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.7 }}
                >
                  {phaseLabels[phase]}
                </motion.span>
              </AnimatePresence>
              <span className="font-sans text-xs text-foreground-soft tabular-nums">
                {secondsLeft}s
              </span>
            </div>
          </div>

          {/* Quiet reminder — appears after a few seconds */}
          <motion.p
            className="text-xs text-foreground-soft text-center leading-loose max-w-xs font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ delay: 4, duration: 2.5 }}
          >
            No hay nada que hacer excepto respirar.
          </motion.p>
        </div>
      )}
    </motion.div>
  );
}
