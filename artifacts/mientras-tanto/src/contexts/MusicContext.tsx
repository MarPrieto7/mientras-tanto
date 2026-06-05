import React, {
  createContext, useContext, useRef, useState,
  useCallback, useEffect
} from "react";

// ─── Background track ───────────────────────────────────────────────
import globalMp3 from "@assets/Inicio_mientras_tanto_1780576324249.mp3";

// ─── Emotion tracks ─────────────────────────────────────────────────
import saturadoMp3  from "@assets/Saturado_1780576331234.mp3";
import tristeMp3    from "@assets/Triste_1780576331234.mp3";
import vacioMp3     from "@assets/Vacio_1780576331235.mp3";
import cansadoMp3   from "@assets/Cansado_1780577053561.mp3";
import sensibleMp3  from "@assets/Sensible_1780578122550.mp3";
import confundidoMp3 from "@assets/Confundido_1780578329702.mp3";
import enCalmaMp3   from "@assets/En_Calma_1780578779386.mp3";

// ─── Volume configuration ────────────────────────────────────────────
export type VolumeMode = "normal" | "soft" | "off";

const BASE_VOLUMES: Record<VolumeMode, number> = {
  normal: 0.18,
  soft:   0.09,
  off:    0,
};

const EMOTION_VOLUMES: Record<string, number> = {
  saturado:   0.22,
  triste:     0.17,
  vacio:      0.11,
  cansado:    0.15,
  sensible:   0.17,
  confundido: 0.17,
  "en calma": 0.13,
};

const EMOTION_MP3S: Record<string, string> = {
  saturado:   saturadoMp3,
  triste:     tristeMp3,
  vacio:      vacioMp3,
  cansado:    cansadoMp3,
  sensible:   sensibleMp3,
  confundido: confundidoMp3,
  "en calma": enCalmaMp3,
};

const FADE_IN_GLOBAL = 4.5;   // first-play fade-in (seconds)
const FADE_EMOTION   = 2.5;   // emotion fade-in
const FADE_OUT       = 3;     // emotion / global restore fade

// ─── Types ──────────────────────────────────────────────────────────
interface MusicContextType {
  volumeMode: VolumeMode;
  cycleVolume: () => void;
  activeEmotionId: string | null;
  playEmotion: (id: string) => void;
  stopEmotion: () => void;
}

const MusicContext = createContext<MusicContextType>({
  volumeMode: "soft",
  cycleVolume: () => {},
  activeEmotionId: null,
  playEmotion: () => {},
  stopEmotion: () => {},
});

// ─── Helpers ─────────────────────────────────────────────────────────
function fadeTo(
  audio: HTMLAudioElement,
  target: number,
  durationMs: number,
  onDone?: () => void
): ReturnType<typeof setInterval> {
  const steps = 30;
  const delay = durationMs / steps;
  const start = audio.volume;
  const delta = (target - start) / steps;
  let step = 0;
  const id = setInterval(() => {
    step++;
    audio.volume = Math.min(1, Math.max(0, start + delta * step));
    if (step >= steps) {
      clearInterval(id);
      audio.volume = target;
      onDone?.();
    }
  }, delay);
  return id;
}

// ─── Provider ────────────────────────────────────────────────────────
export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [volumeMode, setVolumeModeState] = useState<VolumeMode>(() =>
    (localStorage.getItem("mt_volume_mode") as VolumeMode) || "soft"
  );
  const [activeEmotionId, setActiveEmotionId] = useState<string | null>(null);

  const globalRef      = useRef<HTMLAudioElement | null>(null);
  const emotionRef     = useRef<HTMLAudioElement | null>(null);
  const globalFadeRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const emotionFadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saturadoRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether global was playing before a duck so we can restore it
  const globalWasPlayingRef = useRef(false);

  const getGlobal = useCallback((): HTMLAudioElement => {
    if (!globalRef.current) {
      const a  = new Audio(globalMp3);
      a.loop   = true;
      a.volume = 0;
      globalRef.current = a;
    }
    return globalRef.current;
  }, []);

  // ── Cycle volume mode ──────────────────────────────────────────────
  // Soft → Normal → Off → Soft
  const cycleVolume = useCallback(() => {
    const order: VolumeMode[] = ["soft", "normal", "off"];
    setVolumeModeState(prev => {
      const next = order[(order.indexOf(prev) + 1) % order.length];
      localStorage.setItem("mt_volume_mode", next);

      // Cancel any in-flight fades
      if (globalFadeRef.current)  clearInterval(globalFadeRef.current);
      if (emotionFadeRef.current) clearInterval(emotionFadeRef.current);

      const g = globalRef.current;
      const e = emotionRef.current;
      const emotionPlaying = !!(e && !e.paused);

      if (next === "off") {
        // Pause everything
        if (g && !g.paused) {
          globalFadeRef.current = fadeTo(g, 0, 1000, () => g.pause());
        }
        if (e && !e.paused) {
          emotionFadeRef.current = fadeTo(e, 0, 1000, () => e.pause());
        }
      } else {
        const factor = next === "soft" ? 0.6 : 1;

        // Global — only restore if no emotion is currently playing
        if (g && !emotionPlaying) {
          if (g.paused) {
            g.volume = 0;
            g.play().catch(() => {});
          }
          globalFadeRef.current = fadeTo(g, BASE_VOLUMES[next], 1500);
        }

        // Emotion — restore its volume
        if (e) {
          if (e.paused) {
            e.volume = 0;
            e.play().catch(() => {});
          }
          const id   = activeEmotionId || "";
          const base = EMOTION_VOLUMES[id] ?? 0.15;
          emotionFadeRef.current = fadeTo(e, base * factor, 1500);
        }
      }

      return next;
    });
  }, [activeEmotionId]);

  // ── Start global track (first play) ───────────────────────────────
  const startGlobal = useCallback(() => {
    const g = getGlobal();
    if (!g.paused) return;                     // already playing
    if (volumeMode === "off") return;           // muted by user
    g.volume = 0;
    g.play().catch(() => {});
    globalFadeRef.current = fadeTo(g, BASE_VOLUMES[volumeMode], FADE_IN_GLOBAL * 1000);
  }, [volumeMode, getGlobal]);

  // ── Stop global completely (used in Sentir so tracks don't overlap) ─
  const stopGlobalForEmotion = useCallback(() => {
    if (globalFadeRef.current) clearInterval(globalFadeRef.current);
    const g = globalRef.current;
    if (!g) return;
    globalWasPlayingRef.current = !g.paused;
    if (g.paused) return; // already stopped
    globalFadeRef.current = fadeTo(g, 0, 2000, () => g.pause());
  }, []);

  // ── Resume global after emotion ends ─────────────────────────────
  const resumeGlobalAfterEmotion = useCallback(() => {
    if (globalFadeRef.current) clearInterval(globalFadeRef.current);
    const g = globalRef.current;
    if (!g || volumeMode === "off") return;
    if (!globalWasPlayingRef.current) return; // wasn't playing before
    if (g.paused) {
      g.volume = 0;
      g.play().catch(() => {});
    }
    globalFadeRef.current = fadeTo(g, BASE_VOLUMES[volumeMode], FADE_OUT * 1000);
  }, [volumeMode]);

  // ── Play emotion ──────────────────────────────────────────────────
  const playEmotion = useCallback((id: string) => {
    // Stop previous emotion
    const prev = emotionRef.current;
    if (prev) {
      if (emotionFadeRef.current) clearInterval(emotionFadeRef.current);
      fadeTo(prev, 0, 800, () => { prev.pause(); prev.currentTime = 0; });
    }
    if (saturadoRef.current) {
      clearTimeout(saturadoRef.current);
      saturadoRef.current = null;
    }

    const url = EMOTION_MP3S[id];
    if (!url) return;

    // Completely stop global — no overlap in Sentir
    stopGlobalForEmotion();

    const factor  = volumeMode === "off" ? 0 : volumeMode === "soft" ? 0.6 : 1;
    const baseVol = (EMOTION_VOLUMES[id] ?? 0.15) * factor;

    const audio  = new Audio(url);
    audio.loop   = true;
    audio.volume = 0;
    emotionRef.current = audio;
    setActiveEmotionId(id);

    if (factor > 0) {
      audio.play().catch(() => {});
      emotionFadeRef.current = fadeTo(audio, baseVol, FADE_EMOTION * 1000);
    }

    // Saturado: soften after 20 s
    if (id === "saturado") {
      saturadoRef.current = setTimeout(() => {
        const e = emotionRef.current;
        if (e && !e.paused) fadeTo(e, 0.18 * factor, 5000);
      }, 20_000);
    }
  }, [volumeMode, stopGlobalForEmotion]);

  // ── Stop emotion ──────────────────────────────────────────────────
  const stopEmotion = useCallback(() => {
    const e = emotionRef.current;
    if (e) {
      if (emotionFadeRef.current) clearInterval(emotionFadeRef.current);
      fadeTo(e, 0, FADE_OUT * 1000, () => { e.pause(); e.currentTime = 0; });
      emotionRef.current = null;
    }
    if (saturadoRef.current) {
      clearTimeout(saturadoRef.current);
      saturadoRef.current = null;
    }
    setActiveEmotionId(null);
    resumeGlobalAfterEmotion();
  }, [resumeGlobalAfterEmotion]);

  // ── Auto-start global on first user interaction ───────────────────
  useEffect(() => {
    const handler = () => startGlobal();
    window.addEventListener("pointerdown", handler, { once: true });
    return () => window.removeEventListener("pointerdown", handler);
  }, [startGlobal]);

  // ── Pause music when user leaves the tab / app ───────────────────
  useEffect(() => {
    const handleVisibility = () => {
      const g = globalRef.current;
      const e = emotionRef.current;
      if (document.hidden) {
        // App left — stop everything silently
        if (globalFadeRef.current)  clearInterval(globalFadeRef.current);
        if (emotionFadeRef.current) clearInterval(emotionFadeRef.current);
        g?.pause();
        e?.pause();
      } else {
        // App returned — resume what was playing (unless muted)
        if (volumeMode === "off") return;
        const g2 = globalRef.current;
        const e2 = emotionRef.current;
        // Only resume emotion if one was active; otherwise resume global
        if (e2 && activeEmotionId) {
          if (e2.paused) e2.play().catch(() => {});
        } else if (g2 && g2.paused && g2.src) {
          g2.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [volumeMode, activeEmotionId]);

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      globalRef.current?.pause();
      emotionRef.current?.pause();
    };
  }, []);

  return (
    <MusicContext.Provider value={{
      volumeMode,
      cycleVolume,
      activeEmotionId,
      playEmotion,
      stopEmotion,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => useContext(MusicContext);
