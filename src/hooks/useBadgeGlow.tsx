import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GlowPlan = "featured" | "professional" | "business";
export type GlowStyle = "soft" | "neon";
export interface PlanGlow { enabled: boolean; color: string; color2: string; intensity: number; style: GlowStyle; animate: boolean }
export type GlowConfig = Record<GlowPlan, PlanGlow>;

export const DEFAULT_GLOW: GlowConfig = {
  featured: { enabled: true, color: "#f59e0b", color2: "#f97316", intensity: 5, style: "soft", animate: false },
  professional: { enabled: true, color: "#3b82f6", color2: "#06b6d4", intensity: 6, style: "neon", animate: false },
  business: { enabled: true, color: "#a020f0", color2: "#4f46e5", intensity: 8, style: "neon", animate: true },
};

const HEX = /^#[0-9a-fA-F]{6}$/;
export const normalizeGlow = (raw: unknown): GlowConfig => {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, Partial<PlanGlow>>;
  const out = {} as GlowConfig;
  (Object.keys(DEFAULT_GLOW) as GlowPlan[]).forEach((k) => {
    const d = DEFAULT_GLOW[k]; const v = r[k] || {};
    out[k] = {
      enabled: typeof v.enabled === "boolean" ? v.enabled : d.enabled,
      color: typeof v.color === "string" && HEX.test(v.color) ? v.color : d.color,
      color2: typeof v.color2 === "string" && HEX.test(v.color2) ? v.color2 : d.color2,
      intensity: Math.min(10, Math.max(1, Number(v.intensity) || d.intensity)),
      style: v.style === "soft" || v.style === "neon" ? v.style : d.style,
      animate: typeof v.animate === "boolean" ? v.animate : d.animate,
    };
  });
  return out;
};

let cached: GlowConfig | null = null;
let pending: Promise<GlowConfig> | null = null;
const listeners = new Set<(c: GlowConfig) => void>();

const load = () => {
  if (!pending) {
    pending = Promise.resolve(supabase.rpc("get_badge_glow_config")).then(({ data }) => {
      cached = normalizeGlow(data);
      return cached;
    }).catch(() => (cached = DEFAULT_GLOW));
  }
  return pending;
};

export const setGlowCache = (c: GlowConfig) => { cached = c; listeners.forEach((l) => l(c)); };

export const useBadgeGlow = () => {
  const [config, setConfig] = useState<GlowConfig>(cached ?? DEFAULT_GLOW);
  useEffect(() => {
    listeners.add(setConfig);
    load().then(setConfig);
    return () => { listeners.delete(setConfig); };
  }, []);
  return config;
};

const alpha = (hex: string, a: number) => hex + Math.round(Math.min(1, a) * 255).toString(16).padStart(2, "0");

/** Style for the image container (outer glow) */
export const glowOuterStyle = (g: PlanGlow): CSSProperties => {
  const k = g.intensity / 10;
  return {
    boxShadow: `0 0 0 ${g.style === "neon" ? 2 : 1}px ${alpha(g.color, 0.5 + k * 0.5)}, 0 0 ${10 + k * 20}px ${2 + k * 4}px ${alpha(g.color, 0.25 + k * 0.4)}, 0 0 ${24 + k * 36}px ${4 + k * 8}px ${alpha(g.color2, 0.15 + k * 0.3)}`,
  };
};

/** Style for an overlay inside the image creating neon edge lines */
export const glowInnerStyle = (g: PlanGlow): CSSProperties | undefined => {
  if (g.style !== "neon") return undefined;
  const k = g.intensity / 10;
  return {
    boxShadow: `inset 0 0 0 ${2 + Math.round(k * 2)}px ${g.color}, inset 0 0 ${8 + k * 18}px ${2 + k * 6}px ${alpha(g.color, 0.7)}, inset 0 0 ${24 + k * 40}px ${alpha(g.color2, 0.5)}`,
  };
};
