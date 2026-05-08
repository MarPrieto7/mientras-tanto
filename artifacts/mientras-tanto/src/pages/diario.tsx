import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

type Entry = {
  id: string;
  date: string;
  content: string;
};

export default function Diario() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntry, setNewEntry] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mientras_tanto_journal");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse journal entries", e);
      }
    }
  }, []);

  const saveEntry = () => {
    if (!newEntry.trim()) return;
    
    const entry: Entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      content: newEntry.trim()
    };
    
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem("mientras_tanto_journal", JSON.stringify(updated));
    setNewEntry("");
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem("mientras_tanto_journal", JSON.stringify(updated));
  };

  return (
    <PageTransition>
      <div className="flex flex-col w-full max-w-md mx-auto">
        <header className="mb-8 mt-4 text-center">
          <h2 className="text-3xl font-serif text-foreground mb-2">Tu Diario</h2>
          <p className="text-xs text-foreground-soft tracking-wider">Este espacio es solo tuyo. Nada sale de aquí.</p>
        </header>

        <div className="mb-12">
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Escribe lo que necesites soltar hoy..."
            className="w-full h-48 bg-background-secondary/30 border border-background-secondary/50 rounded-2xl p-6 text-foreground placeholder:text-foreground-soft/50 focus:outline-none focus:ring-1 focus:ring-foreground-soft/30 resize-none transition-all duration-500 font-sans leading-relaxed text-sm"
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={saveEntry}
              disabled={!newEntry.trim()}
              className="px-6 py-2 bg-foreground text-background rounded-full text-xs tracking-wider disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500"
            >
              Guardar
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="group relative bg-background border border-background-secondary/40 rounded-xl p-6 shadow-sm shadow-background-secondary/20"
              >
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="absolute top-4 right-4 p-2 text-foreground-soft/30 hover:text-foreground-soft transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-[10px] text-foreground-soft/70 uppercase tracking-widest mb-3">
                  {new Date(entry.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
          {entries.length === 0 && (
            <div className="text-center text-foreground-soft/50 text-sm mt-12 italic font-serif">
              Aún no has escrito nada. El papel está en blanco esperando por ti.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
