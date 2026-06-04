import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import musicUrl from "@assets/Inicio_mientras_tanto_1780576324249.mp3";

interface MusicContextType {
  isGlobalPlaying: boolean;
  toggleGlobal: () => void;
}

const MusicContext = createContext<MusicContextType>({
  isGlobalPlaying: false,
  toggleGlobal: () => {}
});

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element once
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(musicUrl);
      audio.loop = true;
      audio.volume = 0.22;
      // Fade in smoothly
      audio.onplay = () => {
        audio.volume = 0;
        const fade = setInterval(() => {
          if (audio.volume < 0.22) {
            audio.volume = Math.min(0.22, audio.volume + 0.01);
          } else {
            clearInterval(fade);
          }
        }, 100);
      };
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const toggleGlobal = useCallback(() => {
    if (isGlobalPlaying) {
      // Fade out then pause
      const audio = audioRef.current;
      if (audio) {
        const fade = setInterval(() => {
          if (audio.volume > 0.01) {
            audio.volume = Math.max(0, audio.volume - 0.02);
          } else {
            clearInterval(fade);
            audio.pause();
          }
        }, 80);
      }
      setIsGlobalPlaying(false);
    } else {
      const audio = getAudio();
      audio.play().catch(() => {});
      setIsGlobalPlaying(true);
    }
  }, [isGlobalPlaying, getAudio]);

  // Stop on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isGlobalPlaying, toggleGlobal }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => useContext(MusicContext);
