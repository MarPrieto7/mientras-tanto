import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Heart, BookOpen, Pause, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/como-me-siento", icon: Heart, label: "Sentir" },
    { href: "/diario", icon: BookOpen, label: "Diario" },
    { href: "/pausa", icon: Pause, label: "Pausa" },
    { href: "/hoy-basta", icon: CheckCircle2, label: "Hoy" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-md border-t border-background-secondary px-6 pb-8 pt-4 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center justify-center w-16 h-12 text-foreground-soft hover:text-foreground transition-colors duration-500">
              <Icon strokeWidth={isActive ? 2 : 1.5} className={`w-6 h-6 mb-1 transition-all duration-700 ${isActive ? 'text-foreground scale-110' : 'scale-100'}`} />
              <span className={`text-[10px] font-medium transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
