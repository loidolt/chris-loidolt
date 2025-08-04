'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Seed {
  id: string;
  x: number;
  title: string;
  slug: string;
}

export default function SidescrollerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const animationFrameRef = useRef<number>();
  
  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const GROUND_HEIGHT = 100;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const MOVE_SPEED = 4;
  const PLAYER_SIZE = 32;
  
  // Game state
  const [player, setPlayer] = useState<{ pos: Position; vel: Velocity }>({
    pos: { x: 100, y: 200 },
    vel: { x: 0, y: 0 }
  });
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [cameraX, setCameraX] = useState(0);
  const [interactableSeed, setInteractableSeed] = useState<Seed | null>(null);
  
  // Level data
  const LEVEL_WIDTH = 2000;
  const seeds: Seed[] = [
    { id: '1', x: 300, title: 'React Hooks', slug: 'react-hooks' },
    { id: '2', x: 600, title: 'TypeScript Tips', slug: 'typescript-tips' },
    { id: '3', x: 1000, title: 'Next.js Guide', slug: 'nextjs-guide' },
    { id: '4', x: 1400, title: 'CSS Tricks', slug: 'css-tricks' },
  ];
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
      
      if ((e.key === 'Enter' || e.key === ' ') && interactableSeed) {
        router.push(`/seeds/${interactableSeed.slug}`);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [interactableSeed, router]);
  
  // Game loop
  const gameLoop = useCallback(() => {
    setPlayer(prevPlayer => {
      const newPlayer = { ...prevPlayer };
      const isOnGround = newPlayer.pos.y >= CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;
      
      // Apply gravity
      if (!isOnGround) {
        newPlayer.vel.y += GRAVITY;
      } else {
        newPlayer.vel.y = 0;
        newPlayer.pos.y = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;
      }
      
      // Handle horizontal movement
      newPlayer.vel.x = 0;
      if (keys['ArrowLeft'] || keys['a']) {
        newPlayer.vel.x = -MOVE_SPEED;
      }
      if (keys['ArrowRight'] || keys['d']) {
        newPlayer.vel.x = MOVE_SPEED;
      }
      
      // Handle jumping
      if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && isOnGround) {
        newPlayer.vel.y = JUMP_FORCE;
      }
      
      // Update position
      newPlayer.pos.x += newPlayer.vel.x;
      newPlayer.pos.y += newPlayer.vel.y;
      
      // Keep player in bounds
      newPlayer.pos.x = Math.max(0, Math.min(LEVEL_WIDTH - PLAYER_SIZE, newPlayer.pos.x));
      
      return newPlayer;
    });
    
    // Update camera to follow player
    setCameraX(prevCameraX => {
      const targetX = player.pos.x - CANVAS_WIDTH / 2;
      const clampedX = Math.max(0, Math.min(LEVEL_WIDTH - CANVAS_WIDTH, targetX));
      return prevCameraX + (clampedX - prevCameraX) * 0.1;
    });
    
    // Check for nearby seeds
    const nearbySeed = seeds.find(seed => {
      const distance = Math.abs(seed.x - player.pos.x);
      return distance < 50;
    });
    setInteractableSeed(nearbySeed || null);
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [keys, player.pos.x]);
  
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);
  
  // Render the game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw clouds (parallax background)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '40px monospace';
    for (let i = 0; i < 5; i++) {
      const cloudX = (i * 400 - cameraX * 0.3) % (LEVEL_WIDTH + 100);
      ctx.fillText('☁️', cloudX, 80);
    }
    
    // Draw ground
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Draw grass
    ctx.fillStyle = '#228B22'; // Green
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 20);
    
    // Draw seeds/plants
    ctx.font = '32px monospace';
    seeds.forEach(seed => {
      const screenX = seed.x - cameraX;
      if (screenX > -50 && screenX < CANVAS_WIDTH + 50) {
        // Draw plant pot
        ctx.fillText('🪴', screenX, CANVAS_HEIGHT - GROUND_HEIGHT + 15);
        
        // Draw label
        if (Math.abs(seed.x - player.pos.x) < 100) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.font = '12px sans-serif';
          ctx.fillText(seed.title, screenX - 20, CANVAS_HEIGHT - GROUND_HEIGHT - 10);
          ctx.font = '32px monospace';
        }
      }
    });
    
    // Draw player
    const screenPlayerX = player.pos.x - cameraX;
    ctx.font = '32px monospace';
    ctx.fillText('🚶', screenPlayerX, player.pos.y + PLAYER_SIZE);
    
    // Draw interaction hint
    if (interactableSeed) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(10, 10, 300, 30);
      ctx.fillStyle = '#000';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Press ENTER to read: ${interactableSeed.title}`, 20, 30);
    }
    
    // Draw controls hint
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '12px sans-serif';
    ctx.fillText('A/D or ←/→: Move  |  W or ↑ or SPACE: Jump', 10, CANVAS_HEIGHT - 10);
  }, [player, cameraX, interactableSeed]);
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-4">Garden Sidescroller</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-600 rounded"
        />
      </div>
      
      <div className="mt-4 text-white text-center max-w-md">
        <p className="mb-2">Explore the forest and discover content!</p>
        <p className="text-sm opacity-75">Walk near plants and press ENTER to read</p>
      </div>
    </div>
  );
}