"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "../../providers/ThemeProvider";

interface GlowParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  color: string;
}

// Dark mode luminous neon palette
const DARK_PALETTE: Record<string, string> = {
  cyan: "#38bdf8",
  emerald: "#10b981",
  amber: "#fbbf24",
  rose: "#f43f5e",
  violet: "#c084fc",
};

// Light mode high-contrast pigment palette
const LIGHT_PALETTE: Record<string, string> = {
  cyan: "#0284c7",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  violet: "#7c3aed",
};

export default function DynamicCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const isDarkRef = useRef(theme === "dark");

  useEffect(() => {
    isDarkRef.current = theme === "dark";
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasFinePointer || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: GlowParticle[] = [];
    let currentColorKey = "cyan";

    // Detect section or UI context color from element under cursor
    const updateActiveColorKey = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      // 1. Direct data attribute
      const section = el.closest("[data-trail-color]");
      if (section) {
        const key = section.getAttribute("data-trail-color") || "cyan";
        if (DARK_PALETTE[key]) {
          currentColorKey = key;
          return;
        }
      }

      // 2. Contextual UI classes across in-app pages
      const classList = (el as HTMLElement).className || "";
      if (typeof classList === "string") {
        if (classList.includes("danger") || classList.includes("rose") || classList.includes("red")) {
          currentColorKey = "rose";
          return;
        }
        if (classList.includes("warning") || classList.includes("amber") || classList.includes("yellow")) {
          currentColorKey = "amber";
          return;
        }
        if (classList.includes("good") || classList.includes("emerald") || classList.includes("green")) {
          currentColorKey = "emerald";
          return;
        }
        if (classList.includes("purple") || classList.includes("violet")) {
          currentColorKey = "violet";
          return;
        }
      }

      currentColorKey = "cyan";
    };

    let lastX = 0;
    let lastY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      updateActiveColorKey(e);

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2.5) {
        lastX = e.clientX;
        lastY = e.clientY;

        const isDark = isDarkRef.current;
        const activePalette = isDark ? DARK_PALETTE : LIGHT_PALETTE;
        const color = activePalette[currentColorKey] || activePalette.cyan;

        const count = Math.min(3, Math.floor(dist / 6) + 1);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: e.clientX + (Math.random() - 0.5) * 4,
            y: e.clientY + (Math.random() - 0.5) * 4,
            size: isDark ? Math.random() * 2.2 + 1.2 : Math.random() * 1.8 + 1.0,
            alpha: isDark ? 0.75 : 0.85,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25 - 0.05,
            color,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const isDark = isDarkRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= isDark ? 0.92 : 0.90;

        if (p.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (isDark) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowColor = "rgba(15, 23, 42, 0.2)";
          ctx.shadowBlur = 2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const isDark = theme === "dark";

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        mixBlendMode: isDark ? "screen" : "normal",
        opacity: isDark ? 0.8 : 0.9,
      }}
      aria-hidden="true"
    />
  );
}
