import { useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";

const KEY = "listingGridCols";
const listeners = new Set<(n: number) => void>();
const read = () => {
  const n = parseInt(localStorage.getItem(KEY) || "");
  return n >= 2 && n <= 4 ? n : 2;
};

export const setGridCols = (n: number) => {
  localStorage.setItem(KEY, String(n));
  listeners.forEach((l) => l(n));
};

const COLS: Record<number, string> = {
  2: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6",
  3: "grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4",
  4: "grid-cols-4 lg:grid-cols-6 gap-1.5 lg:gap-3",
};

export const useGridLayout = () => {
  const [cols, setCols] = useState(read);
  useEffect(() => {
    listeners.add(setCols);
    return () => { listeners.delete(setCols); };
  }, []);
  return { cols, gridClass: `grid ${COLS[cols]}` };
};

export const GridLayoutToggle = () => {
  const { cols } = useGridLayout();
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      <LayoutGrid className="h-4 w-4 text-muted-foreground mx-1" />
      {[2, 3, 4].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setGridCols(n)}
          className={`h-7 w-7 rounded-md text-sm font-bold transition-colors ${cols === n ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
};
