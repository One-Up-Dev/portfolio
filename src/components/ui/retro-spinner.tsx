"use client";

import { useEffect, useState } from "react";

interface RetroSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * 8-bit Game Boy style loading spinner
 * Features a pixelated, retro gaming aesthetic
 */
export function RetroSpinner({
  size = "md",
  className = "",
}: RetroSpinnerProps) {
  const [frame, setFrame] = useState(0);

  // Animate through frames for Game Boy style effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 8);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  // 8-bit pixel art frames for the spinner (simplified Game Boy style)
  const pixels = [
    // Frame patterns - creates rotating block effect
    [1, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
  ];

  return (
    <div
      className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}
      role="status"
      aria-label="Loading"
    >
      {/* Outer rotating squares - Game Boy style */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-0.5">
        {pixels[frame].map((active, i) => (
          <div
            key={i}
            className={`transition-all duration-75 ${
              active
                ? "bg-primary shadow-[0_0_4px_hsl(var(--primary))]"
                : "bg-primary/20"
            }`}
            style={{
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>

      {/* Center pixel */}
      <div className="absolute w-1/4 h-1/4 bg-primary animate-pulse" />
    </div>
  );
}

/**
 * Simple 8-bit style loading text with blinking cursor
 */
export function RetroLoadingText({ text = "LOADING" }: { text?: string }) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-pixel text-primary text-sm tracking-wider">
      {text}
      {".".repeat(dots)}
      <span className="animate-pulse ml-1">_</span>
    </span>
  );
}

/**
 * Combined spinner with text for full retro loading experience
 */
export function RetroLoader({
  size = "md",
  text = "LOADING",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <RetroSpinner size={size} />
      <RetroLoadingText text={text} />
    </div>
  );
}
