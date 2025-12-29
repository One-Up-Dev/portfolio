"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSounds } from "@/lib/sound-context";

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

// Game constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 24;
const ENEMY_WIDTH = 24;
const ENEMY_HEIGHT = 16;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 12;
const PLAYER_SPEED = 8;
const BULLET_SPEED = 10;
const ENEMY_SPEED_INITIAL = 0.5;
const ENEMY_DROP_AMOUNT = 10;
const ENEMIES_PER_ROW = 8;
const ENEMY_ROWS = 3;

// Colors - retro neon palette
const COLORS = {
  background: "#0a0a0a",
  player: "#00ff00",
  playerAccent: "#00cc00",
  enemy1: "#ff0066",
  enemy2: "#ff00ff",
  enemy3: "#00ffff",
  enemy4: "#ffff00",
  bullet: "#00ff00",
  enemyBullet: "#ff0000",
  text: "#00ff00",
  scoreText: "#00ffff",
};

interface Enemy {
  x: number;
  y: number;
  alive: boolean;
  type: number;
}

interface Bullet {
  x: number;
  y: number;
  isEnemy: boolean;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
}

// Helper to get leaderboard from localStorage
function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("space_invaders_leaderboard");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

// Helper to save leaderboard to localStorage
function saveLeaderboard(leaderboard: LeaderboardEntry[]) {
  if (typeof window === "undefined") return;
  // Keep only top 10
  const top10 = leaderboard.slice(0, 10);
  localStorage.setItem("space_invaders_leaderboard", JSON.stringify(top10));
}

// Pixel art player ship
function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const pixelSize = 4;
  const shape = [
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  ];

  ctx.fillStyle = COLORS.player;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        ctx.fillRect(
          x + col * pixelSize - 16,
          y + row * pixelSize - 12,
          pixelSize,
          pixelSize,
        );
      }
    }
  }
}

// Pixel art enemy
function drawEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: number,
  frame: number,
) {
  const pixelSize = 3;
  const colors = [COLORS.enemy1, COLORS.enemy2, COLORS.enemy3, COLORS.enemy4];
  ctx.fillStyle = colors[type % colors.length];

  // Different enemy shapes based on type
  const shapes = [
    // Type 0 - Classic invader
    frame % 2 === 0
      ? [
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
        ]
      : [
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
          [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
          [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        ],
    // Type 1 - Squid
    frame % 2 === 0
      ? [
          [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        ]
      : [
          [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
        ],
    // Type 2 - Crab
    frame % 2 === 0
      ? [
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
        ]
      : [
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
        ],
    // Type 3 - Octopus
    frame % 2 === 0
      ? [
          [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        ]
      : [
          [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        ],
  ];

  const shape = shapes[type % shapes.length];
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        ctx.fillRect(
          x + col * pixelSize - 12,
          y + row * pixelSize - 8,
          pixelSize,
          pixelSize,
        );
      }
    }
  }
}

export function SpaceInvaders() {
  const [isOpen, setIsOpen] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<
    "menu" | "playing" | "gameover" | "enterName"
  >("menu");
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [username, setUsername] = useState("");
  const { playSound } = useSounds();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const playerRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const enemyDirectionRef = useRef(1);
  const enemySpeedRef = useRef(ENEMY_SPEED_INITIAL);
  const lastShotRef = useRef(0);
  const lastEnemyShotRef = useRef(0);
  const frameRef = useRef(0);
  const scoreRef = useRef(0);
  const waveRef = useRef(1);

  // Initialize leaderboard on mount
  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  // Konami code detection
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isOpen) return;

      const newSequence = [...keySequence, e.code].slice(-KONAMI_CODE.length);
      setKeySequence(newSequence);

      if (
        newSequence.length === KONAMI_CODE.length &&
        newSequence.every((key, i) => key === KONAMI_CODE[i])
      ) {
        setIsOpen(true);
        setGameState("menu");
        setKeySequence([]);
        playSound("success");
      }
    },
    [keySequence, isOpen, playSound],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && gameState !== "playing") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, gameState]);

  // Show hint after inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 5000);
      }
    }, 60000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Initialize enemies for a wave
  const initializeEnemies = useCallback((waveNum: number) => {
    const enemies: Enemy[] = [];
    const rows = Math.min(ENEMY_ROWS + Math.floor(waveNum / 3), 6);
    const startY = 60;
    const spacing = 45;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < ENEMIES_PER_ROW; col++) {
        enemies.push({
          x: 50 + col * spacing,
          y: startY + row * 35,
          alive: true,
          type: row % 4,
        });
      }
    }
    enemiesRef.current = enemies;
    enemySpeedRef.current = ENEMY_SPEED_INITIAL + waveNum * 0.3;
    enemyDirectionRef.current = 1;
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setWave(1);
    scoreRef.current = 0;
    waveRef.current = 1;
    playerRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40 };
    bulletsRef.current = [];
    initializeEnemies(1);
    playSound("click");
  }, [initializeEnemies, playSound]);

  // Game over
  const endGame = useCallback(() => {
    setGameState("enterName");
    setScore(scoreRef.current);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    playSound("error");
  }, [playSound]);

  // Submit score
  const submitScore = useCallback(() => {
    if (username.length !== 3) return;

    const newEntry: LeaderboardEntry = {
      username: username.toUpperCase(),
      score: scoreRef.current,
      date: new Date().toISOString(),
    };

    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(newLeaderboard);
    saveLeaderboard(newLeaderboard);
    setUsername("");
    setGameState("gameover");
    playSound("success");
  }, [username, leaderboard, playSound]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => {
      frameRef.current++;

      // Clear canvas
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw starfield background
      ctx.fillStyle = "#222222";
      for (let i = 0; i < 50; i++) {
        const x = (i * 37 + frameRef.current * 0.1) % CANVAS_WIDTH;
        const y = (i * 23 + frameRef.current * 0.05) % CANVAS_HEIGHT;
        ctx.fillRect(x, y, 2, 2);
      }

      // Handle player movement
      const player = playerRef.current;
      if (keysRef.current.has("ArrowLeft") || keysRef.current.has("KeyA")) {
        player.x = Math.max(PLAYER_WIDTH / 2, player.x - PLAYER_SPEED);
      }
      if (keysRef.current.has("ArrowRight") || keysRef.current.has("KeyD")) {
        player.x = Math.min(
          CANVAS_WIDTH - PLAYER_WIDTH / 2,
          player.x + PLAYER_SPEED,
        );
      }

      // Handle shooting
      const now = Date.now();
      if (
        (keysRef.current.has("Space") || keysRef.current.has("KeyW")) &&
        now - lastShotRef.current > 250
      ) {
        bulletsRef.current.push({
          x: player.x,
          y: player.y - PLAYER_HEIGHT / 2,
          isEnemy: false,
        });
        lastShotRef.current = now;
        playSound("click");
      }

      // Enemy shooting
      const aliveEnemies = enemiesRef.current.filter((e) => e.alive);
      if (aliveEnemies.length > 0 && now - lastEnemyShotRef.current > 2500) {
        const shooter =
          aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        bulletsRef.current.push({
          x: shooter.x,
          y: shooter.y + ENEMY_HEIGHT / 2,
          isEnemy: true,
        });
        lastEnemyShotRef.current = now;
      }

      // Update bullets
      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        if (bullet.isEnemy) {
          bullet.y += BULLET_SPEED * 0.4; // Slower enemy bullets
        } else {
          bullet.y -= BULLET_SPEED;
        }
        return bullet.y > 0 && bullet.y < CANVAS_HEIGHT;
      });

      // Update enemies
      let shouldDrop = false;
      const enemies = enemiesRef.current;
      const speed = enemySpeedRef.current;
      const dir = enemyDirectionRef.current;

      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        enemy.x += speed * dir;
        if (enemy.x < 30 || enemy.x > CANVAS_WIDTH - 30) {
          shouldDrop = true;
        }
      }

      if (shouldDrop) {
        enemyDirectionRef.current *= -1;
        for (const enemy of enemies) {
          if (enemy.alive) {
            enemy.y += ENEMY_DROP_AMOUNT;
            // Check if enemy reached player
            if (enemy.y > CANVAS_HEIGHT - 80) {
              endGame();
              return;
            }
          }
        }
      }

      // Collision detection - player bullets vs enemies
      for (const bullet of bulletsRef.current) {
        if (bullet.isEnemy) continue;
        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          if (
            Math.abs(bullet.x - enemy.x) < ENEMY_WIDTH / 2 + BULLET_WIDTH / 2 &&
            Math.abs(bullet.y - enemy.y) < ENEMY_HEIGHT / 2 + BULLET_HEIGHT / 2
          ) {
            enemy.alive = false;
            bullet.y = -100; // Remove bullet
            scoreRef.current += 10 * waveRef.current;
            setScore(scoreRef.current);
            playSound("success");
          }
        }
      }

      // Collision detection - enemy bullets vs player
      for (const bullet of bulletsRef.current) {
        if (!bullet.isEnemy) continue;
        if (
          Math.abs(bullet.x - player.x) < PLAYER_WIDTH / 2 + BULLET_WIDTH / 2 &&
          Math.abs(bullet.y - player.y) < PLAYER_HEIGHT / 2 + BULLET_HEIGHT / 2
        ) {
          endGame();
          return;
        }
      }

      // Check for wave completion
      if (enemies.every((e) => !e.alive)) {
        waveRef.current++;
        setWave(waveRef.current);
        initializeEnemies(waveRef.current);
        playSound("success");
      }

      // Draw player
      drawPlayer(ctx, player.x, player.y);

      // Draw enemies
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        drawEnemy(ctx, enemy.x, enemy.y, enemy.type, frameRef.current);
      }

      // Draw bullets
      for (const bullet of bulletsRef.current) {
        ctx.fillStyle = bullet.isEnemy ? COLORS.enemyBullet : COLORS.bullet;
        ctx.fillRect(
          bullet.x - BULLET_WIDTH / 2,
          bullet.y - BULLET_HEIGHT / 2,
          BULLET_WIDTH,
          BULLET_HEIGHT,
        );
      }

      // Draw HUD
      ctx.fillStyle = COLORS.scoreText;
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${scoreRef.current}`, 10, 25);
      ctx.textAlign = "right";
      ctx.fillText(`WAVE: ${waveRef.current}`, CANVAS_WIDTH - 10, 25);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    // Key handlers for game
    const handleGameKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (e.code === "Space") e.preventDefault();
    };
    const handleGameKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener("keydown", handleGameKeyDown);
    window.addEventListener("keyup", handleGameKeyUp);
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleGameKeyDown);
      window.removeEventListener("keyup", handleGameKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, endGame, initializeEnemies, playSound]);

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby="space-invaders-title"
    >
      <div className="relative flex flex-col items-center">
        {/* Title */}
        <h2
          id="space-invaders-title"
          className="mb-4 text-center font-pixel text-2xl text-green-400 animate-pulse"
          style={{ textShadow: "0 0 10px #00ff00" }}
        >
          SPACE INVADERS
        </h2>

        {/* Game Canvas */}
        <div
          className="relative border-4 border-green-500"
          style={{
            boxShadow: "0 0 20px rgba(0, 255, 0, 0.3)",
            imageRendering: "pixelated",
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block"
            style={{ imageRendering: "pixelated" }}
          />

          {/* Menu Overlay */}
          {gameState === "menu" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <div className="text-center space-y-6">
                <div className="font-pixel text-green-400 text-xl animate-pulse">
                  PRESS START
                </div>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-green-600 text-black font-pixel text-lg rounded-none border-4 border-green-400 hover:bg-green-500 transition-colors"
                  style={{ boxShadow: "4px 4px 0 rgba(0,255,0,0.5)" }}
                >
                  START GAME
                </button>

                {/* Leaderboard on menu */}
                {leaderboard.length > 0 && (
                  <div className="mt-6">
                    <div className="font-pixel text-yellow-400 text-sm mb-2">
                      HIGH SCORES
                    </div>
                    <div className="text-left font-mono text-xs text-green-300 space-y-1">
                      {leaderboard.slice(0, 5).map((entry, i) => (
                        <div key={i} className="flex justify-between gap-4">
                          <span>
                            {i + 1}. {entry.username}
                          </span>
                          <span>{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-4">
                  CONTROLS: ←→ or A/D to move, SPACE to shoot
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-xs text-gray-500 hover:text-gray-400"
                >
                  Press ESC to exit
                </button>
              </div>
            </div>
          )}

          {/* Enter Name Overlay */}
          {gameState === "enterName" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
              <div className="text-center space-y-6">
                <div className="font-pixel text-red-500 text-2xl animate-pulse">
                  GAME OVER
                </div>
                <div className="font-pixel text-yellow-400 text-lg">
                  SCORE: {score}
                </div>
                <div className="font-pixel text-green-400 text-sm">
                  ENTER YOUR NAME
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 3),
                    )
                  }
                  maxLength={3}
                  placeholder="A1B"
                  className="w-24 px-4 py-2 bg-black border-2 border-green-500 text-green-400 font-pixel text-center text-xl uppercase tracking-widest focus:outline-none focus:border-yellow-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && username.length === 3) {
                      submitScore();
                    }
                  }}
                />
                <div className="text-xs text-gray-500">A-Z 0-9, max 3</div>
                <button
                  onClick={submitScore}
                  disabled={username.length !== 3}
                  className="px-6 py-2 bg-green-600 text-black font-pixel text-sm rounded-none border-2 border-green-400 hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SUBMIT
                </button>
              </div>
            </div>
          )}

          {/* Game Over Overlay with Leaderboard */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 overflow-auto py-4">
              <div className="text-center space-y-4">
                <div className="font-pixel text-yellow-400 text-lg">
                  HIGH SCORES
                </div>
                <div className="text-left font-mono text-sm text-green-300 space-y-1 px-4 max-h-60 overflow-auto">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex justify-between gap-8 ${
                        entry.score === score ? "text-yellow-400" : ""
                      }`}
                    >
                      <span>
                        {String(i + 1).padStart(2, " ")}. {entry.username}
                      </span>
                      <span>{String(entry.score).padStart(6, " ")}</span>
                    </div>
                  ))}
                </div>
                <div className="space-x-4 pt-4">
                  <button
                    onClick={startGame}
                    className="px-6 py-2 bg-green-600 text-black font-pixel text-sm rounded-none border-2 border-green-400 hover:bg-green-500 transition-colors"
                  >
                    PLAY AGAIN
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 bg-gray-700 text-white font-pixel text-sm rounded-none border-2 border-gray-500 hover:bg-gray-600 transition-colors"
                  >
                    EXIT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game info during gameplay */}
        {gameState === "playing" && (
          <div className="mt-4 space-y-2">
            <div className="text-center text-sm text-yellow-400 font-pixel">
              WAVE: {wave}
            </div>
            <div className="text-center text-xs text-gray-500 font-pixel">
              ←→ MOVE | SPACE SHOOT | ESC PAUSE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
