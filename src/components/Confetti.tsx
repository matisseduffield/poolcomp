"use client";

import { useEffect, useRef, useCallback } from "react";

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  gravity: number;
  opacity: number;
  decay: number;
}

const COLORS = [
  "#60a5fa", "#3b82f6", // blue
  "#f87171", "#ef4444", // red
  "#fbbf24", "#fcd34d", // gold
  "#34d399", "#10b981", // emerald
  "#a78bfa", "#8b5cf6", // purple
  "#ffffff",
];

export default function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const spawn = useCallback(() => {
    const particles: Particle[] = [];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < 120; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.6,
        y: h * 0.3 + (Math.random() - 0.5) * h * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.12 + Math.random() * 0.08,
        opacity: 1,
        decay: 0.008 + Math.random() * 0.006,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particlesRef.current = spawn();
    startRef.current = performance.now();

    function draw(now: number) {
      const elapsed = now - startRef.current;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const ps = particlesRef.current;
      let alive = false;

      for (const p of ps) {
        if (p.opacity <= 0) continue;
        alive = true;

        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;

        if (elapsed > duration * 0.4) {
          p.opacity -= p.decay;
        }

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = Math.max(0, p.opacity);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      if (alive && elapsed < duration + 2000) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    }

    animRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animRef.current);
  }, [active, duration, spawn]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[60] pointer-events-none"
    />
  );
}
