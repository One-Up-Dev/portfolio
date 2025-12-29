"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface SoundContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  playSound: (sound: "coin" | "click" | "success" | "error") => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

// Sound file paths
const SOUNDS = {
  coin: "/sounds/coin_c_02-102844.mp3",
  click: "/sounds/coin_c_02-102844.mp3", // Using coin sound for clicks too
  success: "/sounds/coin_c_02-102844.mp3",
  error: "/sounds/coin_c_02-102844.mp3",
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("oneup-sound-enabled");
    if (saved !== null) {
      setSoundEnabled(saved === "true");
    }
  }, []);

  // Save preference when changed
  const handleSetSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem("oneup-sound-enabled", String(enabled));
  }, []);

  const toggleSound = useCallback(() => {
    handleSetSoundEnabled(!soundEnabled);
  }, [soundEnabled, handleSetSoundEnabled]);

  const playSound = useCallback(
    (sound: "coin" | "click" | "success" | "error") => {
      if (!soundEnabled) return;

      try {
        // Create new audio instance for each play to allow overlapping sounds
        const audio = new Audio(SOUNDS[sound]);
        audio.volume = 0.5;
        audio.play().catch((err) => {
          // Ignore autoplay errors (user hasn't interacted yet)
          console.debug("Sound play prevented:", err.message);
        });
      } catch (err) {
        console.debug("Sound error:", err);
      }
    },
    [soundEnabled],
  );

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled: handleSetSoundEnabled,
        toggleSound,
        playSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSounds() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSounds must be used within a SoundProvider");
  }
  return context;
}

// Hook to play sound on button click
export function useButtonSound() {
  const { playSound } = useSounds();

  const playClickSound = useCallback(() => {
    playSound("coin");
  }, [playSound]);

  return playClickSound;
}
