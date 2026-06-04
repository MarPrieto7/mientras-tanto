import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAutoMode: boolean;
};

const STORAGE_KEY = "mientras_tanto_theme";
const AUTO_KEY = "mientras_tanto_theme_auto";

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "light",
  setTheme: () => null,
  isAutoMode: true,
});

// Night hours: 20:00 → 07:00
function isNightHour(): boolean {
  const h = new Date().getHours();
  return h >= 20 || h < 7;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isAutoMode, setIsAutoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(AUTO_KEY);
    return saved === null ? true : saved === "true";
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const manual = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const auto = localStorage.getItem(AUTO_KEY);
    // If user never manually set it (auto mode), use time-based default
    if (auto === null || auto === "true") {
      return isNightHour() ? "dark" : "light";
    }
    return (manual as Theme) || "light";
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // In auto mode, re-check every minute in case hour changes
  useEffect(() => {
    if (!isAutoMode) return;
    const check = () => {
      const nightNow = isNightHour();
      setThemeState(nightNow ? "dark" : "light");
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [isAutoMode]);

  const setTheme = (t: Theme) => {
    // When user manually changes theme, disable auto mode
    setIsAutoMode(false);
    localStorage.setItem(AUTO_KEY, "false");
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, isAutoMode }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
