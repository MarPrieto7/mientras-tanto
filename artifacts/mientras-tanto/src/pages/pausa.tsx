import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

type Ritual = {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'breathe' | 'timer' | 'write';
};

const rituals: Ritual[] = [
  {
    id: "respirar",
    title: "Respirar",
    description: "Inhala suavemente, sostén y exhala despacio.",
    duration: 60,
    type: 'breathe'
  },
  {
    id: "observar",
    title: "Observar",
    description: "Nombra 5 cosas que puedes ver ahora mismo.",
    duration: 120,
    type: 'timer'
  },
  {
    id: "escribir",
    title: "Escribir",
    description: "Escribe lo primero que llega a tu mente sin juzgarlo.",
    duration: 0,
    type: 'write'
  },
  {
    id: "escuchar",
    title: "Escuchar",
    description: "Cierra los ojos y escucha los sonidos a tu alrededor.",
    duration: 60,
    type: 'timer'
  },
  {
    id: "parar",
    title: "Parar",
    description: "No hagas nada. Solo existe aquí por unos minutos.",
    duration: 180,
    type: 'timer'
  }
];

export default function Pausa() {
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [writeText, setWriteText] = useState("");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startRitual = (ritual: Ritual) => {
    setSelectedRitual(ritual);
    if (ritual.type === 'timer' || ritual.type === 'breathe') {
      setTimeLeft(ritual.duration);
      setIsActive(true);
    }
    if (ritual.type === 'write') {
      setWriteText("");
    }
  };

  const closeRitual = () => {
    setSelectedRitual(null);
    setIsActive(false);
    setWriteText("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <PageTransition>
      <div className="flex flex-col w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {!selectedRitual ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
              className="w-full space-y-4"
            >
              <h2 className="text-3xl font-serif text-center mb-8 text-foreground">
                Pequeñas pausas
              </h2>
              {rituals.map(ritual => (
                <button
                  key={ritual.id}
                  onClick={() => startRitual(ritual)}
                  className="w-full text-left p-6 rounded-2xl border border-background-secondary bg-background hover:bg-background-secondary/50 transition-all duration-500 group"
                >
                  <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-foreground transition-colors">
                    {ritual.title}
                  </h3>
                  <p className="text-sm text-foreground-soft">{ritual.description}</p>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="ritual"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center justify-center w-full min-h-[60vh] relative"
            >
              <button
                onClick={closeRitual}
                className="absolute top-0 left-0 p-2 text-foreground-soft hover:text-foreground transition-colors z-10"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <h2 className="text-2xl font-serif text-foreground mb-4">
                {selectedRitual.title}
              </h2>
              <p className="text-foreground-soft text-center text-sm mb-12 max-w-xs">
                {selectedRitual.description}
              </p>

              {selectedRitual.type === 'breathe' && (
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1.5, 1], opacity: [0.3, 0.7, 0.7, 0.3] }}
                    transition={{ duration: 12, times: [0, 0.33, 0.66, 1], repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-32 h-32 rounded-full bg-lavender/30 blur-xl"
                  />
                  <div className="z-10 font-serif text-2xl text-foreground">
                    {timeLeft > 0 ? formatTime(timeLeft) : 'Terminado'}
                  </div>
                </div>
              )}

              {selectedRitual.type === 'timer' && (
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-background-secondary" />
                    <circle
                      cx="96" cy="96" r="88"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="transparent"
                      strokeDasharray="553"
                      strokeDashoffset={553 - (timeLeft / selectedRitual.duration) * 553}
                      className="text-foreground transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="z-10 font-serif text-3xl text-foreground">
                    {timeLeft > 0 ? formatTime(timeLeft) : 'Listo'}
                  </div>
                </div>
              )}

              {selectedRitual.type === 'write' && (
                <div className="w-full space-y-3">
                  <textarea
                    value={writeText}
                    onChange={e => setWriteText(e.target.value)}
                    placeholder="La mente está abierta..."
                    className="w-full h-48 bg-transparent border border-background-secondary rounded-2xl p-6 text-foreground placeholder:text-foreground-soft/50 focus:outline-none focus:ring-1 focus:ring-foreground-soft/30 resize-none transition-all duration-500 font-sans text-sm"
                  />
                  {/* Ephemeral disclaimer */}
                  <p className="text-center text-[10px] text-foreground-soft/40 tracking-wide font-sans italic">
                    Este texto es efímero — desaparece al salir. Solo está aquí para ti, ahora.
                  </p>
                </div>
              )}

              {(selectedRitual.type === 'timer' || selectedRitual.type === 'breathe') && (
                <button
                  onClick={() => {
                    if (timeLeft === 0) {
                      setTimeLeft(selectedRitual.duration);
                      setIsActive(true);
                    } else {
                      setIsActive(!isActive);
                    }
                  }}
                  className="mt-8 px-6 py-2 border border-background-secondary rounded-full text-foreground-soft hover:text-foreground hover:bg-background-secondary/30 transition-all duration-300 text-sm tracking-wide"
                >
                  {timeLeft === 0 ? 'Reiniciar' : isActive ? 'Pausar' : 'Continuar'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
