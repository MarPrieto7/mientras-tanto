import { Link, useLocation } from "wouter";
import { Home, Heart, BookOpen, PauseCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/como-me-siento", icon: Heart, label: "Sentir" },
  { href: "/diario", icon: BookOpen, label: "Diario" },
  { href: "/pausa", icon: PauseCircle, label: "Pausa" },
  { href: "/hoy-basta", icon: CheckCircle2, label: "Hoy" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-background/85 backdrop-blur-md border-t border-background-secondary/60">
      <div className="max-w-lg mx-auto flex justify-around items-center px-2 py-3 pb-safe">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              className="relative flex flex-col items-center justify-center w-16 py-1 text-foreground-soft hover:text-foreground transition-colors duration-500 group"
            >
              <Icon
                strokeWidth={isActive ? 1.8 : 1.3}
                className={`w-5 h-5 mb-1 transition-all duration-500 ${isActive ? "text-foreground" : "text-foreground-soft"}`}
              />
              <span className={`text-[10px] font-sans tracking-wide transition-all duration-500 ${isActive ? "opacity-100 text-foreground" : "opacity-0"}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-3 w-4 h-0.5 rounded-full bg-foreground/40"
                  transition={{ type: "spring", stiffness: 350, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
