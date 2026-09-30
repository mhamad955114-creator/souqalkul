import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GridLayoutConfig = { mobile: number; desktop: number };
export const DEFAULT_GRID: GridLayoutConfig = { mobile: 2, desktop: 4 };

let cache: GridLayoutConfig | null = null;
let pending: Promise<GridLayoutConfig> | null = null;
const listeners = new Set<(c: GridLayoutConfig) => void>();

const clamp = (n: any, d: number) => Math.min(4, Math.max(2, parseInt(n) || d));

export const loadGridLayout = (force = false): Promise<GridLayoutConfig> => {
  if (cache && !force) return Promise.resolve(cache);
  if (pending && !force) return pending;
  pending = (async () => {
    try {
      const { data } = await (supabase.rpc as any)("get_grid_layout_config");
      cache = { mobile: clamp(data?.mobile, 2), desktop: clamp(data?.desktop, 4) };
    } catch { cache = DEFAULT_GRID; }
    pending = null;
    return cache!;
  })();
  return pending;
};

export const setGridLayoutCache = (c: GridLayoutConfig) => { cache = c; listeners.forEach((l) => l(c)); };

const MOBILE: Record<number, string> = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
const DESKTOP: Record<number, string> = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

export const useGridLayout = () => {
  const [cfg, setCfg] = useState<GridLayoutConfig>(cache || DEFAULT_GRID);
  useEffect(() => {
    loadGridLayout().then(setCfg);
    listeners.add(setCfg);
    return () => { listeners.delete(setCfg); };
  }, []);
  const gap = cfg.mobile >= 3 ? "gap-2" : "gap-4";
  return { cfg, gridClass: `grid ${MOBILE[cfg.mobile]} md:grid-cols-3 ${DESKTOP[cfg.desktop]} ${gap} lg:gap-6` };
};
