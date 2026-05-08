import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

type EmotionState = "saturado" | "triste" | "vacio" | "cansado" | "sensible" | "confundido" | "en calma" | null;

const emotions = [
  { id: "saturado", label: "Saturado" },
  { id: "triste", label: "Triste" },
  { id: "vacio", label: "Vacío" },
  { id: "cansado", label: "Cansado" },
  { id: "sensible", label: "Sensible" },
  { id: "confundido", label: "Confundido" },
  { id: "en calma", label: "En calma" }
] as const;

const practices = {
  saturado: {
    phrase: "Tu mente necesita descanso, no soluciones.",
    practice: "Respira suavemente. 4 tiempos para inhalar, 4 tiempos para sostener, 4 para exhalar."
  },
  triste: {
    phrase: "La tristeza también es una forma de sentir profundamente.",
    practice: "Escribe 3 cosas que notaste hoy, por pequeñas que sean."
  },
  vacio: {
    phrase: "El vacío a veces es el principio de algo nuevo.",
    practice: "Siéntate en silencio por 2 minutos. Solo respira."
  },
  cansado: {
    phrase: "Descansar no es rendirse.",
    practice: "Nota suavemente cada parte de tu cuerpo. Desde los pies hasta la cabeza."
  },
  sensible: {
    phrase: "Tu sensibilidad es una forma de inteligencia.",
    practice: "Escribe una carta breve para ti mismo, con la misma ternura que usarías para un amigo."
  },
  confundido: {
    phrase: "No necesitas saberlo todo hoy.",
    practice: "Escribe 1 sola cosa de la que sí estás seguro en este momento."
  },
  "en calma": {
    phrase: "Qué regalo estar aquí contigo en calma.",
    practice: "Observa 3 cosas a tu alrededor lentamente. Agradece este momento."
  }
};

export default function ComoMeSiento() {
  const [selected, setSelected] = useState<EmotionState>(() => {
    return (localStorage.getItem("mientras_tanto_emotion") as EmotionState) || null;
  });

  const handleSelect = (id: EmotionState) => {
    setSelected(id);
    if (id) {
      localStorage.setItem("mientras_tanto_emotion", id);
    } else {
      localStorage.removeItem("mientras_tanto_emotion");
    }
  };

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
              <h2 className="text-3xl font-serif mb-12 text-center text-foreground">¿Cómo estás hoy?</h2>
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.id}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center w-full relative"
            >
              <button 
                onClick={() => handleSelect(null)}
                className="absolute -top-12 left-0 p-2 text-foreground-soft hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-30 text-fog">
                  <path fill="currentColor" d="M47.7,-57.2C59.5,-47.3,65.2,-30.1,68.5,-12.7C71.7,4.7,72.4,22.3,63.9,35.5C55.4,48.7,37.6,57.5,19.2,63.3C0.8,69.2,-19.9,72,-36.8,65.2C-53.8,58.4,-67,42.1,-73.4,23.3C-79.8,4.4,-79.3,-17.1,-69.6,-33.1C-60,-49.2,-41.2,-59.8,-24.5,-63C-7.8,-66.2,6.9,-62,23.5,-59.2C35.9,-67.2,47.7,-57.2,47.7,-57.2Z" transform="translate(100 100) scale(1.1)" />
                </svg>
                <span className="font-serif text-xl z-10 text-foreground">{emotions.find(e => e.id === selected)?.label}</span>
              </div>

              <h3 className="text-2xl font-serif text-center mb-8 text-foreground px-4 leading-relaxed">
                "{practices[selected].phrase}"
              </h3>

              <div className="bg-background-secondary/30 p-8 rounded-2xl w-full border border-background-secondary/50 backdrop-blur-sm">
                <p className="text-foreground-soft text-center leading-relaxed text-sm">
                  {practices[selected].practice}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
