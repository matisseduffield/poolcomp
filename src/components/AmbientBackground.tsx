"use client";

import { useEffect, useRef } from "react";

/** Floating ambient orbs rendered on canvas behind the UI */
export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    interface Orb {
      x: number;
      y: number;
      r: number;
      dx: number;
      dy: number;
      color: string;
      opacity: number;
      phase: number;
    }

    const orbs: Orb[] = [];

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function createOrbs() {
      orbs.length = 0;
      const colors = [
        "59, 130, 246",   // blue
        "239, 68, 68",    // red
        "251, 191, 36",   // amber
        "99, 102, 241",   // indigo
        "16, 185, 129",   // emerald
      ];

      for (let i = 0; i < 6; i++) {
        orbs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 120 + Math.random() * 200,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          color: colors[i % colors.length],
          opacity: 0.03 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, w, h);

      for (const orb of orbs) {
        orb.x += orb.dx;
        orb.y += orb.dy;

        // Wrap around
        if (orb.x < -orb.r) orb.x = w + orb.r;
        if (orb.x > w + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = h + orb.r;
        if (orb.y > h + orb.r) orb.y = -orb.r;

        const pulse = Math.sin(time * 0.001 + orb.phase) * 0.3 + 0.7;
        const gradient = ctx!.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.r
        );
        gradient.addColorStop(0, `rgba(${orb.color}, ${orb.opacity * pulse})`);
        gradient.addColorStop(1, `rgba(${orb.color}, 0)`);

        ctx!.fillStyle = gradient;
        ctx!.fillRect(orb.x - orb.r, orb.y - orb.r, orb.r * 2, orb.r * 2);
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    createOrbs();
    animId = requestAnimationFrame(draw);

    window.addEventListener("resize", () => {
      resize();
      createOrbs();
    });

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
