"use client";

import { useState, useEffect, useCallback } from "react";

// Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

// Pixel art sprites as CSS art
const PixelHeart = () => (
  <div className="inline-block animate-bounce">
    <div className="grid grid-cols-8 gap-px">
      {/* Row 1 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2"></div>
      {/* Row 2 */}
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-400"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-400"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      {/* Row 3 */}
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      {/* Row 4 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2"></div>
      {/* Row 5 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      {/* Row 6 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
    </div>
  </div>
);

const PixelStar = () => (
  <div className="inline-block animate-spin-slow">
    <div className="grid grid-cols-5 gap-px">
      {/* Row 1 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      {/* Row 2 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-300"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2"></div>
      {/* Row 3 */}
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-300"></div>
      <div className="w-2 h-2 bg-yellow-200"></div>
      <div className="w-2 h-2 bg-yellow-300"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      {/* Row 4 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-300"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2"></div>
      {/* Row 5 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2"></div>
    </div>
  </div>
);

const PixelMushroom = () => (
  <div className="inline-block animate-pulse">
    <div className="grid grid-cols-7 gap-px">
      {/* Row 1 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      {/* Row 2 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-white"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-white"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2"></div>
      {/* Row 3 */}
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-white"></div>
      <div className="w-2 h-2 bg-white"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-white"></div>
      <div className="w-2 h-2 bg-white"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      {/* Row 4 */}
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      <div className="w-2 h-2 bg-red-500"></div>
      {/* Row 5 - stem */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-amber-100"></div>
      <div className="w-2 h-2 bg-amber-100"></div>
      <div className="w-2 h-2 bg-amber-100"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      {/* Row 6 - stem */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-amber-200"></div>
      <div className="w-2 h-2 bg-amber-100"></div>
      <div className="w-2 h-2 bg-amber-200"></div>
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2"></div>
    </div>
  </div>
);

const PixelCoin = () => (
  <div className="inline-block animate-bounce delay-100">
    <div className="grid grid-cols-6 gap-px">
      {/* Row 1 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2"></div>
      {/* Row 2 */}
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-300"></div>
      <div className="w-2 h-2 bg-yellow-200"></div>
      <div className="w-2 h-2 bg-yellow-300"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-500"></div>
      {/* Row 3 */}
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-200"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-300"></div>
      <div className="w-2 h-2 bg-yellow-500"></div>
      {/* Row 4 */}
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-300"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-500"></div>
      {/* Row 5 */}
      <div className="w-2 h-2 bg-yellow-500"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-400"></div>
      <div className="w-2 h-2 bg-yellow-500"></div>
      <div className="w-2 h-2 bg-yellow-600"></div>
      {/* Row 6 */}
      <div className="w-2 h-2"></div>
      <div className="w-2 h-2 bg-yellow-500"></div>
      <div className="w-2 h-2 bg-yellow-500"></div>
      <div className="w-2 h-2 bg-yellow-500"></div>
      <div className="w-2 h-2 bg-yellow-500"></div>
      <div className="w-2 h-2"></div>
    </div>
  </div>
);

export function KonamiModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const newSequence = [...keySequence, e.code].slice(-KONAMI_CODE.length);
      setKeySequence(newSequence);

      // Check if the sequence matches
      if (
        newSequence.length === KONAMI_CODE.length &&
        newSequence.every((key, i) => key === KONAMI_CODE[i])
      ) {
        setIsOpen(true);
        setKeySequence([]);
      }
    },
    [keySequence],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Show hint after 30 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 5000);
      }
    }, 60000); // Show hint after 1 minute

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) {
    return showHint ? (
      <div className="fixed bottom-4 right-4 z-50 animate-pulse">
        <div className="rounded-lg bg-card border border-border px-3 py-2 text-xs text-muted-foreground font-pixel">
          ↑ ↑ ↓ ↓ ← → ← → B A
        </div>
      </div>
    ) : null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="konami-title"
    >
      <div
        className="relative mx-4 max-w-lg overflow-hidden rounded-none border-4 border-primary bg-background p-8 shadow-[8px_8px_0_rgba(233,69,96,0.5)]"
        onClick={(e) => e.stopPropagation()}
        style={{ imageRendering: "pixelated" }}
      >
        {/* Pixel art border effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-4 h-4 bg-primary"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-primary"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-primary"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary"></div>
        </div>

        {/* Title */}
        <h2
          id="konami-title"
          className="mb-6 text-center font-pixel text-xl text-primary animate-pulse"
        >
          🎮 SECRET UNLOCKED! 🎮
        </h2>

        {/* Pixel art sprites */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <PixelHeart />
          <PixelStar />
          <PixelMushroom />
          <PixelCoin />
        </div>

        {/* Message */}
        <div className="mb-6 space-y-3 text-center">
          <p className="font-pixel text-sm text-foreground">
            YOU FOUND THE EASTER EGG!
          </p>
          <p className="text-sm text-muted-foreground">
            Bravo, tu as trouvé le code secret ! Tu es un vrai gamer.
          </p>
          <p className="font-pixel text-xs text-primary animate-bounce">
            +30 LIVES
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4 rounded border border-border bg-card/50 p-4">
          <div className="text-center">
            <div className="font-pixel text-lg text-primary">∞</div>
            <div className="text-xs text-muted-foreground">Café</div>
          </div>
          <div className="text-center">
            <div className="font-pixel text-lg text-green-400">9999</div>
            <div className="text-xs text-muted-foreground">Lines of Code</div>
          </div>
          <div className="text-center">
            <div className="font-pixel text-lg text-yellow-400">100%</div>
            <div className="text-xs text-muted-foreground">Passion</div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full rounded-none border-4 border-primary bg-primary px-6 py-3 font-pixel text-sm text-primary-foreground transition-all hover:bg-primary/90 active:translate-y-1"
          style={{
            boxShadow: "4px 4px 0 rgba(0,0,0,0.4)",
          }}
        >
          CONTINUE
        </button>

        {/* Decorative corner pixels */}
        <div className="absolute -top-2 -left-2 w-2 h-2 bg-primary"></div>
        <div className="absolute -top-2 -right-2 w-2 h-2 bg-primary"></div>
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-primary"></div>
        <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-primary"></div>
      </div>
    </div>
  );
}
