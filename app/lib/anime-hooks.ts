"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/**
 * §2: Check if reduced motion is preferred
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * §3: Check if device has fine pointer (not touch-only)
 */
function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * §5: Check if viewport is mobile-sized
 */
function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
}

export function useTextReveal(selector: string, options = {}) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    animate(Array.from(elements), {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      delay: stagger(80, { start: 200 }),
      easing: "easeOutExpo",
      ...options,
    });
  }, [selector, options]);
}

export function useNumberCounter(selector: string, endValue: number, options = {}) {
  const animated = useRef(false);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el || animated.current) return;

    // §2: If reduced motion, just show the final value immediately
    if (prefersReducedMotion()) {
      el.textContent = endValue.toLocaleString();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animated.current = true;
          const obj = { value: 0 };
          animate(obj, {
            value: endValue,
            duration: 1800,
            easing: "easeOutExpo",
            round: 1,
            update: () => {
              el.textContent = obj.value.toLocaleString();
            },
            ...options,
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [selector, endValue, options]);
}

export function useParallax(selector: string, strength = 0.3) {
  useEffect(() => {
    // §5: No parallax on mobile
    if (isMobileViewport() || prefersReducedMotion()) return;
    const el = document.querySelector(selector);
    if (!el) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const rate = scrolled * strength;
      (el as HTMLElement).style.transform = `translate3d(0, ${rate}px, 0)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selector, strength]);
}

export function useScrollReveal(selector: string, options = {}) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    // §2: If reduced motion, show elements immediately
    if (prefersReducedMotion()) {
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
      return;
    }

    // §5: Reduce transform distance on mobile
    const translateY = isMobileViewport() ? 16 : 40;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            animate(entry.target as HTMLElement, {
              opacity: [0, 1],
              translateY: [translateY, 0],
              scale: [0.97, 1],
              duration: isMobileViewport() ? 500 : 900,
              delay: i * 100,
              easing: "easeOutExpo",
              ...options,
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "-50px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, options]);
}

export function useFloatingAnimation(selector: string, options = {}) {
  useEffect(() => {
    // §2/§5: No looping animations if reduced motion or mobile
    if (prefersReducedMotion() || isMobileViewport()) return;

    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    animate(Array.from(elements), {
      translateY: [
        { value: 0, duration: 0 },
        { value: -12, duration: 2000 },
        { value: 0, duration: 2000 },
      ],
      easing: "easeInOutSine",
      loop: true,
      delay: stagger(400),
      ...options,
    });
  }, [selector, options]);
}

export function useMagneticHover(selector: string, strength = 0.3) {
  useEffect(() => {
    // §3: Only on devices with fine pointers — no meaning on touch
    if (!hasFinePointer() || prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);
    const cleanups: (() => void)[] = [];

    elements.forEach((el) => {
      const handleMove = (e: MouseEvent) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        animate(el as HTMLElement, {
          translateX: x * strength,
          translateY: y * strength,
          duration: 300,
          easing: "easeOutQuad",
        });
      };
      const handleLeave = () => {
        animate(el as HTMLElement, {
          translateX: 0,
          translateY: 0,
          duration: 500,
          easing: "easeOutElastic",
        });
      };
      (el as HTMLElement).addEventListener("mousemove", handleMove);
      (el as HTMLElement).addEventListener("mouseleave", handleLeave);
      cleanups.push(() => {
        (el as HTMLElement).removeEventListener("mousemove", handleMove);
        (el as HTMLElement).removeEventListener("mouseleave", handleLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [selector, strength]);
}

export function useStaggeredEntrance(selector: string, options = {}) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    animate(Array.from(elements), {
      opacity: [0, 1],
      translateY: [50, 0],
      rotateX: [15, 0],
      duration: 1000,
      delay: stagger(120, { start: 300 }),
      easing: "easeOutExpo",
      ...options,
    });
  }, [selector, options]);
}

export function useScrollProgress(selector: string, onProgress: (progress: number) => void) {
  useEffect(() => {
    const el = document.querySelector(selector);
    if (!el) return;

    const handleScroll = () => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = 1 - rect.top / (rect.height + windowHeight);
      onProgress(Math.max(0, Math.min(1, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selector, onProgress]);
}

export function useHeroParallax(bgSelector: string, contentSelector: string) {
  useEffect(() => {
    // §5: No parallax on mobile — performance issue on lower-end phones
    if (isMobileViewport() || prefersReducedMotion()) return;

    const bg = document.querySelector(bgSelector);
    const content = document.querySelector(contentSelector);
    if (!bg || !content) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const rate = scrolled * 0.4;
      (bg as HTMLElement).style.transform = `translate3d(0, ${rate}px, 0) scale(1.1)`;
      (content as HTMLElement).style.transform = `translate3d(0, ${scrolled * 0.15}px, 0)`;
      (content as HTMLElement).style.opacity = String(Math.max(0, 1 - scrolled / 600));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [bgSelector, contentSelector]);
}
