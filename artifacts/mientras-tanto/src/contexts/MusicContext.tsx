import React, {
  createContext, useContext, useRef, useState,
  useCallback, useEffect
} from "react";

// ─── Background track ───────────────────────────────────────────────
import globalMp3 from "@assets/Inicio_mientras_tanto_1780576324249.mp3";

// ─── Emotion tracks ─────────────────────────────────────────────────
import saturadoMp3 from "@assets/Saturado_1780576331234.mp3";
import tristeMp3 from "@assets/Triste_1780576331234.mp3";
import vacioMp3 from "@assets/Vacio_1780576331235.mp3";
import cansadoMp3 from "@assets/Cansado_1780577053561.mp3";
import sensibleMp3 from "@assets/Sensible_1780578122550.mp3";
import confundidoMp3 from "@assets/Confundido_1780578329702.mp3";
import enCalmaMp3 from "@assets/En_Calma_1780578779386.mp3";

// ─── Volume configuration ────────────────────────────────────────────
export type VolumeMode = "normal" | "soft" | "off";

const BASE_VOLUMES: Record<VolumeMode, number> = {
  normal: 0.18,
  soft:   0.09, // default — "music accompanies, never demands"
  off:    0,
};

const EMOTION_VOLUMES: Record<string, number> = {
  saturado:   0.22, // drops to 0.18 after 20 s
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

const GLOBAL_DUCKED  = 0.03;  // global volume while emotion plays
const FADE_IN_GLOBAL = 4.5;   // seconds for global fade-in on first play
const FADE_EMOTION   = 2.5;   // emotion fade-in
const FADE_OUT       = 3;     // emotion / global restore fade duration

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
) {
  const steps  = 30;
  const delay  = durationMs / steps;
  const start  = audio.volume;
  const delta  = (target - start) / steps;
  let step     = 0;
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
  const [volumeMode, setVolumeModeState] = useState<VolumeMode>(() => {
    return (localStorage.getItem("mt_volume_mode") as VolumeMode) || "soft";
  });
  const [activeEmotionId, setActiveEmotionId] = useState<string | null>(null);

  const globalRef    = useRef<HTMLAudioElement | null>(null);
  const emotionRef   = useRef<HTMLAudioElement | null>(null);
  const fadeIdRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const saturadoRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure global audio element exists
  const getGlobal = useCallback((): HTMLAudioElement => {
    if (!globalRef.current) {
      const a = new Audio(globalMp3);
      a.loop   = true;
      a.volume = 0;
      globalRef.current = a;
    }
    return globalRef.current;
  }, []);

  // ── Cycle volume mode ──────────────────────────────────────────────
  const cycleVolume = useCallback(() => {
    const order: VolumeMode[] = ["soft", "normal", "off"];
    setVolumeModeState(prev => {
      const next = order[(order.indexOf(prev) + 1) % order.length];
      localStorage.setItem("mt_volume_mode", next);

      const g = globalRef.current;
      if (g && !g.paused) {
        const isDucked = !!emotionRef.current && !emotionRef.current.paused;
        const target   = isDucked ? GLOBAL_DUCKED : BASE_VOLUMES[next];
        fadeTo(g, target, 1500);
      }

      const e = emotionRef.current;
      if (e && !e.paused) {
        const id = activeEmotionId || "";
        const base = EMOTION_VOLUMES[id] ?? 0.15;
        const factor = next === "off" ? 0 : next === "soft" ? 0.6 : 1;
        fadeTo(e, base * factor, 1500);
      }
      return next;
    });
  }, [activeEmotionId]);

  // ── Play global track ─────────────────────────────────────────────
  // Called from inside this module automatically — no external toggle needed.
  // The global track auto-starts on the first user interaction anywhere in the app.
  const startGlobal = useCallback(() => {
    const g = getGlobal();
    if (!g.paused) return;
    const baseVol = BASE_VOLUMES[volumeMode];
    if (baseVol === 0) return; // off mode

    g.volume = 0;
    g.play().catch(() => {});
    fadeTo(g, baseVol, FADE_IN_GLOBAL * 1000);
  }, [volumeMode, getGlobal]);

  // ── Duck / Unduck global ──────────────────────────────────────────
  const duckGlobal = useCallback(() => {
    const g = globalRef.current;
    if (!g || g.paused) return;
    if (fadeIdRef.current) clearInterval(fadeIdRef.current);
    fadeIdRef.current = fadeTo(g, GLOBAL_DUCKED, 2500);
  }, []);

  const unduckGlobal = useCallback(() => {
    const g = globalRef.current;
    if (!g || g.paused) return;
    if (fadeIdRef.current) clearInterval(fadeIdRef.current);
    const baseVol = BASE_VOLUMES[volumeMode];
    fadeIdRef.current = fadeTo(g, baseVol, FADE_OUT * 1000);
  }, [volumeMode]);

  // ── Play emotion ──────────────────────────────────────────────────
  const playEmotion = useCallback((id: string) => {
    // Stop any previous emotion audio
    const prev = emotionRef.current;
    if (prev) {
      fadeTo(prev, 0, 1000, () => { prev.pause(); prev.currentTime = 0; });
    }
    if (saturadoRef.current) {
      clearTimeout(saturadoRef.current);
      saturadoRef.current = null;
    }

    // Auto-start global if it hasn't begun yet
    startGlobal();

    const url = EMOTION_MP3S[id];
    if (!url) return;

    const factor  = volumeMode === "off" ? 0 : volumeMode === "soft" ? 0.6 : 1;
    const baseVol = (EMOTION_VOLUMES[id] ?? 0.15) * factor;

    const audio   = new Audio(url);
    audio.loop    = true;
    audio.volume  = 0;
    emotionRef.current = audio;

    setActiveEmotionId(id);
    duckGlobal();

    audio.play().catch(() => {});
    fadeTo(audio, baseVol, FADE_EMOTION * 1000);

    // Saturado: reduce from 22% → 18% after 20 s (respects volume factor)
    if (id === "saturado") {
      saturadoRef.current = setTimeout(() => {
        const e = emotionRef.current;
        if (e && !e.paused) fadeTo(e, 0.18 * factor, 5000);
      }, 20_000);
    }
  }, [volumeMode, duckGlobal, startGlobal]);

  // ── Stop emotion ──────────────────────────────────────────────────
  const stopEmotion = useCallback(() => {
    const e = emotionRef.current;
    if (e) {
      fadeTo(e, 0, FADE_OUT * 1000, () => { e.pause(); e.currentTime = 0; });
      emotionRef.current = null;
    }
    if (saturadoRef.current) {
      clearTimeout(saturadoRef.current);
      saturadoRef.current = null;
    }
    setActiveEmotionId(null);
    unduckGlobal();
  }, [unduckGlobal]);

  // ── Auto-start global on first user interaction ───────────────────
  useEffect(() => {
    const handler = () => {
      startGlobal();
      window.removeEventListener("pointerdown", handler);
    };
    window.addEventListener("pointerdown", handler, { once: true });
    return () => window.removeEventListener("pointerdown", handler);
  }, [startGlobal]);

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
