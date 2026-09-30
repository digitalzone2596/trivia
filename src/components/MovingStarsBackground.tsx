import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  speedAlpha: number;
  vy: number;
  color: string;
}

export const MovingStarsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 440);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 840);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Paleta de estrellas inspirada en la referencia (doradas, blancas, azuladas suaves)
    const starColors = ['#f59e0b', '#fbbf24', '#ffffff', '#e0f2fe', '#38bdf8'];
    const starCount = 65;
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        targetAlpha: Math.random() * 0.9 + 0.1,
        speedAlpha: Math.random() * 0.02 + 0.005,
        vy: -(Math.random() * 0.35 + 0.15), // Flotación lenta hacia arriba
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dibujar estrellas flotantes y parpadeantes
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Mover estrella
        star.y += star.vy;
        if (star.y < -10) {
          star.y = height + 10;
          star.x = Math.random() * width;
        }

        // Parpadeo suave
        if (Math.abs(star.alpha - star.targetAlpha) < 0.05) {
          star.targetAlpha = Math.random() * 0.85 + 0.15;
        }
        if (star.alpha < star.targetAlpha) {
          star.alpha += star.speedAlpha;
        } else {
          star.alpha -= star.speedAlpha;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
        ctx.fillStyle = star.color;
        ctx.shadowBlur = star.size * 3;
        ctx.shadowColor = star.color;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
