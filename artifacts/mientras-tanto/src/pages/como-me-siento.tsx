import { useState, useEffect, useRef } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wind, Music } from "lucide-react";
import { useLocation } from "wouter";
import { emotionProfiles, startAmbient, AmbientHandle, EmotionId } from "@/lib/ambient";

// MP3 imports — only 3 were provided; others fall back to generated ambient sound
import saturadoMp3 from "@assets/Saturado_1780576331234.mp3";
import tristeMp3 from "@assets/Triste_1780576331234.mp3";
import vacioMp3 from "@assets/Vacio_1780576331235.mp3";

type EmotionState = "saturado" | "triste" | "vacio" | "cansado" | "sensible" | "confundido" | "en calma" | null;

// Map: which emotions have a real MP3 file
const emotionMp3Map: Partial<Record<NonNullable<EmotionState>, string>> = {
  saturado: saturadoMp3,
  triste: tristeMp3,
  vacio: vacioMp3
};

const emotions = [
  { id: "saturado", label: "Saturado" },
  { id: "triste", label: "Triste" },
  { id: "vacio", label: "Vacío" },
  { id: "cansado", label: "Cansado" },
  { id: "sensible", label: "Sensible" },
  { id: "confundido", label: "Confundido" },
  { id: "en calma", label: "En calma" }
] as const;

const practices: Record<NonNullable<EmotionState>, { phrase: string; practice: string }> = {
  saturado: {
    phrase: "Tu mente necesita descanso, no soluciones.",
    practice: "Respira suavemente. 4 tiempos para inhalar, 4 para sostener, 4 para exhalar. No necesitas resolver nada ahora."
  },
  triste: {
    phrase: "La tristeza también es una forma de sentir profundamente.",
    practice: "Escribe 3 cosas pequeñas que notaste hoy. No tienen que ser buenas, solo reales."
  },
  vacio: {
    phrase: "El vacío a veces es el principio de algo nuevo.",
    practice: "Siéntate en silencio por 2 minutos. Solo respira. No tienes que llenar ese espacio."
  },
  cansado: {
    phrase: "Descansar no es rendirse.",
    practice: "Nota suavemente cada parte de tu cuerpo, desde los pies hasta la cabeza. Sin juzgar, solo observando."
  },
  sensible: {
    phrase: "Tu sensibilidad es una forma de inteligencia.",
    practice: "Escribe una carta breve para ti mismo, con la misma ternura que usarías para alguien que quieres."
  },
  confundido: {
    phrase: "No necesitas saberlo todo hoy.",
    practice: "Escribe 1 sola cosa de la que sí estás seguro en este momento. Solo una."
  },
  "en calma": {
    phrase: "Qué regalo estar aquí contigo en calma.",
    practice: "Observa 3 cosas a tu alrededor muy lentamente. Agradece este momento tal como es."
  }
};

const blobs: Record<NonNullable<EmotionState>, string> = {
  saturado: "M47.7,-57.2C59.5,-47.3,65.2,-30.1,68.5,-12.7C71.7,4.7,72.4,22.3,63.9,35.5C55.4,48.7,37.6,57.5,19.2,63.3C0.8,69.2,-19.9,72,-36.8,65.2C-53.8,58.4,-67,42.1,-73.4,23.3C-79.8,4.4,-79.3,-17.1,-69.6,-33.1C-60,-49.2,-41.2,-59.8,-24.5,-63C-7.8,-66.2,6.9,-62,23.5,-59.2C35.9,-67.2,47.7,-57.2,47.7,-57.2Z",
  triste: "M40.5,-51.2C52.8,-40.3,63,-27.1,65.2,-12.8C67.4,1.5,61.7,17,52.3,28.8C43,40.6,30.1,48.7,15.3,54.6C0.5,60.5,-16.2,64.2,-30,59.4C-43.8,54.6,-54.6,41.3,-61.1,25.5C-67.6,9.7,-69.7,-8.6,-64.2,-24C-58.7,-39.4,-45.5,-51.9,-31.1,-62C-16.7,-72.1,-1.2,-79.8,12.8,-78.1C26.8,-76.4,28.2,-62.1,40.5,-51.2Z",
  vacio: "M38.2,-48.7C50.5,-38.3,62.1,-27.4,66.5,-13.3C70.9,0.8,67.2,18.1,58.3,31.3C49.4,44.5,35.3,53.5,19.8,60.2C4.2,66.8,-12.8,71.1,-27.4,66.4C-42,61.7,-54.2,48,-62.7,31.7C-71.3,15.4,-76.3,-3.5,-72.3,-20.2C-68.3,-36.8,-55.3,-51.2,-40.6,-61.1C-25.8,-71,-9.3,-76.4,4.8,-81.9C18.9,-87.4,25.9,-59.1,38.2,-48.7Z",
  cansado: "M44.1,-55.8C57.7,-46.7,69.5,-33.4,73.8,-17.7C78,2,74.8,16.1,65.9,30.7C57,45.4,42.4,56.7,26.3,64.2C10.2,71.7,-7.5,75.5,-23,70.6C-38.5,65.8,-51.8,52.2,-61.3,36.3C-70.8,20.4,-76.5,2.2,-74.3,-15.5C-72,-33.1,-61.7,-50.1,-47.5,-59.2C-33.4,-68.3,-15.4,-69.5,0.8,-70.4C17,-71.3,30.5,-64.9,44.1,-55.8Z",
  sensible: "M36,-46.9C47.5,-37.4,58.3,-27.2,63.3,-13.8C68.2,-0.4,67.3,16.2,60.3,29.6C53.2,43,40.1,53.2,25.4,60.6C10.8,68,-5.4,72.6,-20.2,69.3C-35,65.9,-48.5,54.7,-58.7,40.3C-68.8,25.9,-75.6,8.4,-74.5,-8.7C-73.4,-25.7,-64.4,-42.2,-51.3,-51.7C-38.3,-61.2,-21.1,-63.7,-5.2,-57.7C10.7,-51.7,24.5,-56.4,36,-46.9Z",
  confundido: "M41.3,-52.5C54.4,-42.6,66.6,-31,71.8,-16.3C77.1,-1.5,75.4,16.4,67.6,31.1C59.8,45.8,45.8,57.3,30.1,64.7C14.4,72,-3,75.2,-18.8,70.2C-34.6,65.2,-48.8,52,-59.4,36.2C-70,20.3,-77,1.9,-74.4,-15C-71.7,-31.9,-59.3,-47.4,-44.6,-57.1C-29.9,-66.9,-12.9,-71.8,0.9,-71.8C14.7,-72.8,28.2,-62.4,41.3,-52.5Z",
  "en calma": "M43.9,-57.2C56.7,-46.8,66.6,-33,71.1,-17.4C75.5,-1.7,74.3,15.8,66.8,30C59.2,44.2,45.2,55.1,29.8,62.5C14.4,69.9,-2.4,73.8,-17.8,69.6C-33.1,65.4,-47,53.2,-58.4,38.3C-69.8,23.4,-78.7,5.8,-77.7,-11.9C-76.7,-29.5,-65.8,-47.2,-51.2,-57.5C-36.6,-67.8,-18.3,-70.7,-0.8,-69.7C16.7,-68.6,31.1,-67.6,43.9,-57.2Z"
};

const blobColors: Record<NonNullable<EmotionState>, string> = {
  saturado: "text-fog",
  triste: "text-lavender",
  vacio: "text-sage",
  cansado: "text-fog",
  sensible: "text-lavender",
  confundido: "text-sage",
  "en calma": "text-fog"
};

export default function ComoMeSiento() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<EmotionState>(() => {
    return (localStorage.getItem("mientras_tanto_emotion") as EmotionState) || null;
  });

  // Audio refs — one for MP3, one for ambient fallback
  const mp3AudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientCtxRef = useRef<AudioContext | null>(null);
  const ambientHandleRef = useRef<AmbientHandle | null>(null);

  const stopAllAudio = () => {
    // Stop MP3
    if (mp3AudioRef.current) {
      mp3AudioRef.current.pause();
      mp3AudioRef.current.currentTime = 0;
      mp3AudioRef.current = null;
    }
    // Stop ambient
    ambientHandleRef.current?.stop();
    ambientHandleRef.current = null;
    ambientCtxRef.current = null;
  };

  const playEmotionAudio = (emotion: NonNullable<EmotionState>) => {
    stopAllAudio();

    const mp3Url = emotionMp3Map[emotion];
    if (mp3Url) {
      // Play the real MP3 track
      const audio = new Audio(mp3Url);
      audio.loop = true;
      audio.volume = 0;
      audio.play().catch(() => {});
      // Gentle fade in
      const fade = setInterval(() => {
        if (audio.volume < 0.45) {
          audio.volume = Math.min(0.45, audio.volume + 0.015);
        } else {
          clearInterval(fade);
        }
      }, 100);
      mp3AudioRef.current = audio;
    } else {
      // Fall back to generated ambient sound
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ambientCtxRef.current = ctx;
      const profile = emotionProfiles[emotion as EmotionId];
      if (profile) {
        ambientHandleRef.current = startAmbient(ctx, profile);
      }
    }
  };

  const handleSelect = (id: NonNullable<EmotionState>) => {
    setSelected(id);
    localStorage.setItem("mientras_tanto_emotion", id);
    playEmotionAudio(id);
  };

  const handleBack = () => {
    stopAllAudio();
    setSelected(null);
  };

  // Stop audio when navigating away
  useEffect(() => {
    return () => { stopAllAudio(); };
  }, []);

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-3xl font-serif mb-12 text-center text-foreground leading-relaxed">
                ¿Cómo estás hoy?
              </h2>
              <div className="flex flex-wrap justify-center gap-3 w-full">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.id}
                    data-testid={`button-emotion-${emotion.id}`}
                    onClick={() => handleSelect(emotion.id)}
                    className="px-6 py-3 rounded-full border border-background-secondary bg-background hover:bg-background-secondary text-foreground-soft hover:text-foreground transition-all duration-500 text-sm tracking-wide"
                  >
                    {emotion.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center w-full relative"
            >
              <button
                data-testid="button-back-emotions"
                onClick={handleBack}
                className="absolute -top-8 left-0 p-2 text-foreground-soft hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* Organic blob */}
              <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                  className={`absolute inset-0 w-full h-full opacity-25 ${blobColors[selected]}`}>
                  <path fill="currentColor" d={blobs[selected]} transform="translate(100 100) scale(1.1)" />
                </svg>
                <span className="font-serif text-lg z-10 text-foreground">
                  {emotions.find(e => e.id === selected)?.label}
                </span>
              </div>

              {/* Music playing indicator */}
              <motion.div
                className="flex items-center gap-1.5 mb-4 text-foreground-soft/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                <Music className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-[10px] tracking-widest uppercase font-sans">
                  {emotionMp3Map[selected] ? "música personalizada" : "sonido ambiente"}
                </span>
              </motion.div>

              <h3 className="text-xl font-serif text-center mb-8 text-foreground px-2 leading-relaxed">
                "{practices[selected].phrase}"
              </h3>

              <div className="bg-background-secondary/30 p-7 rounded-2xl w-full border border-background-secondary/50 mb-6">
                <p className="text-foreground-soft text-center leading-relaxed text-sm font-sans">
                  {practices[selected].practice}
                </p>
              </div>

              {/* Modo respiración */}
              <button
                data-testid="button-enter-breathing"
                onClick={() => setLocation("/respiracion")}
                className="flex items-center gap-2 px-7 py-3 rounded-full border border-foreground-soft/25 text-foreground-soft hover:text-foreground hover:border-foreground/40 transition-all duration-700 text-sm tracking-wide font-sans"
              >
                <Wind className="w-4 h-4" strokeWidth={1.5} />
                Modo respiración
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
