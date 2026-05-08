import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const dailyActions = [
  "Bebe un vaso de agua despacio.",
  "Abre la ventana y respira el aire.",
  "Descansa sin culpa hoy.",
  "Camina 5 minutos sin destino.",
  "Llama a alguien que quieras.",
  "Siéntate en silencio 3 minutos.",
  "Come algo que te guste.",
  "Estírate suavemente.",
  "Escucha una canción que amas.",
  "Escribe una cosa por la que estás agradecido.",
  "Date una ducha lenta.",
  "Mira el cielo unos momentos.",
  "Ponte algo cómodo.",
  "Cierra los ojos y no pienses en nada."
];

export default function HoyBasta() {
  const [action, setAction] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Get a deterministic action based on the current date
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Simple hash to pick an index
    const hash = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % dailyActions.length;
    
    setAction(dailyActions[index]);

    // Check if done today
    const saved = localStorage.getItem(`mientras_tanto_hoy_${dateString}`);
    if (saved === 'done') {
      setIsDone(true);
    }
  }, []);

  const toggleDone = () => {
    const today = new Date().toISOString().split('T')[0];
    const newState = !isDone;
    setIsDone(newState);
    
    if (newState) {
      localStorage.setItem(`mientras_tanto_hoy_${today}`, 'done');
    } else {
      localStorage.removeItem(`mientras_tanto_hoy_${today}`);
    }
  };

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full flex flex-col items-center"
        >
          <h2 className="text-sm font-sans tracking-widest text-foreground-soft uppercase mb-16">
            Hoy basta con esto
          </h2>

          <h3 className="text-3xl md:text-4xl font-serif text-foreground leading-relaxed mb-20">
            "{action}"
          </h3>

          <button
            onClick={toggleDone}
            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-700 border ${
              isDone 
                ? 'bg-sage/20 border-sage/30 text-foreground' 
                : 'bg-transparent border-background-secondary text-foreground-soft hover:bg-background-secondary/30'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-500 ${
              isDone ? 'bg-sage border-sage text-background' : 'border-foreground-soft/50'
            }`}>
              {isDone && <Check className="w-3 h-3" strokeWidth={3} />}
            </div>
            <span className="text-sm tracking-wide">
              {isDone ? 'Lo hice hoy' : 'Marcar como hecho'}
            </span>
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
}
