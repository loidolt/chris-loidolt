'use client';

import { useState, useEffect, useRef } from 'react';

interface PixelatedImageProps {
  src: string;
  alt: string;
  className?: string;
  pixelSize?: number;
  hoverToReveal?: boolean;
  clickToReveal?: boolean;
}

export function PixelatedImage({
  src,
  alt,
  className = '',
  pixelSize = 16,
  hoverToReveal = true,
  clickToReveal = false,
}: PixelatedImageProps) {
  const [pixelatedSrc, setPixelatedSrc] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      const width = img.width;
      const height = img.height;

      canvas.width = width;
      canvas.height = height;

      const scaledWidth = Math.ceil(width / pixelSize);
      const scaledHeight = Math.ceil(height / pixelSize);

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

      ctx.drawImage(
        canvas,
        0,
        0,
        scaledWidth,
        scaledHeight,
        0,
        0,
        width,
        height
      );

      setPixelatedSrc(canvas.toDataURL());
      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error('Failed to load image:', src);
      setImageLoaded(true);
    };

    img.src = src;
  }, [src, pixelSize]);

  const handleMouseEnter = () => {
    if (hoverToReveal && !clickToReveal) {
      setIsRevealed(true);
    }
  };

  const handleMouseLeave = () => {
    if (hoverToReveal && !clickToReveal) {
      setIsRevealed(false);
    }
  };

  const handleClick = () => {
    if (clickToReveal) {
      setIsClicked(!isClicked);
    }
  };

  const shouldShowOriginal = clickToReveal ? isClicked : isRevealed;

  if (!imageLoaded && !pixelatedSrc) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ minHeight: '200px', backgroundColor: 'var(--bg-surface)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>[loading...]</span>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <img
        src={shouldShowOriginal ? src : (pixelatedSrc || src)}
        alt={alt}
        className={`w-full h-auto transition-opacity duration-300 ${
          shouldShowOriginal ? 'opacity-100' : 'opacity-100'
        }`}
        style={{
          imageRendering: shouldShowOriginal ? 'auto' : 'pixelated',
        }}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
