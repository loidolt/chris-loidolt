'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// Simple sprite definitions using emojis for now
const SPRITES = {
  player: '🧑‍🌾',
  soil: '🟫',
  seed: '🌱',
  grass: '🟩'
};

interface Position {
  x: number;
  y: number;
}

interface Seed {
  id: string;
  position: Position;
  title: string;
  slug: string;
}

export default function ForestGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [playerPos, setPlayerPos] = useState<Position>({ x: 5, y: 5 });
  const [interactableSeed, setInteractableSeed] = useState<Seed | null>(null);

  // Grid settings
  const GRID_SIZE = 16;
  const CELL_SIZE = 32;

  // Sample seeds/content
  const seeds: Seed[] = [
    { id: '1', position: { x: 3, y: 3 }, title: 'React Hooks', slug: 'react-hooks' },
    { id: '2', position: { x: 7, y: 5 }, title: 'TypeScript Tips', slug: 'typescript-tips' },
    { id: '3', position: { x: 10, y: 8 }, title: 'Next.js Guide', slug: 'nextjs-guide' },
  ];

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      let newPos = { ...playerPos };
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          newPos.y = Math.max(0, playerPos.y - 1);
          break;
        case 'ArrowDown':
        case 's':
          newPos.y = Math.min(GRID_SIZE - 1, playerPos.y + 1);
          break;
        case 'ArrowLeft':
        case 'a':
          newPos.x = Math.max(0, playerPos.x - 1);
          break;
        case 'ArrowRight':
        case 'd':
          newPos.x = Math.min(GRID_SIZE - 1, playerPos.x + 1);
          break;
        case 'Enter':
        case ' ':
          if (interactableSeed) {
            router.push(`/seeds/${interactableSeed.slug}`);
          }
          return;
        default:
          return;
      }
      
      setPlayerPos(newPos);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, interactableSeed, router]);

  // Check for nearby seeds
  useEffect(() => {
    const nearbySeed = seeds.find(seed => {
      const distance = Math.abs(seed.position.x - playerPos.x) + Math.abs(seed.position.y - playerPos.y);
      return distance <= 1;
    });
    setInteractableSeed(nearbySeed || null);
  }, [playerPos]);

  // Render the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#2d5016'; // Dark green background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grass pattern
    ctx.font = '24px monospace';
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        ctx.fillText(SPRITES.grass, x * CELL_SIZE, y * CELL_SIZE + 24);
      }
    }

    // Draw soil patches and seeds
    seeds.forEach(seed => {
      // Draw soil patch
      ctx.fillText(SPRITES.soil, seed.position.x * CELL_SIZE, seed.position.y * CELL_SIZE + 24);
      // Draw seed on top
      ctx.fillText(SPRITES.seed, seed.position.x * CELL_SIZE + 4, seed.position.y * CELL_SIZE + 20);
    });

    // Draw player
    ctx.font = '28px monospace';
    ctx.fillText(SPRITES.player, playerPos.x * CELL_SIZE, playerPos.y * CELL_SIZE + 26);

    // Draw interaction hint
    if (interactableSeed) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(10, canvas.height - 40, 300, 30);
      ctx.fillStyle = '#000';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Press ENTER to read: ${interactableSeed.title}`, 20, canvas.height - 20);
    }
  }, [playerPos, interactableSeed]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-4">Forest of Knowledge</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-2 border-gray-600 rounded"
        />
      </div>
      
      <div className="mt-4 text-white text-center">
        <p className="mb-2">Use WASD or Arrow keys to move</p>
        <p>Press ENTER or SPACE when near a seed 🌱 to read content</p>
      </div>
    </div>
  );
}