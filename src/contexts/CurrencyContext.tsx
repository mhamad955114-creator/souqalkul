import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type CurrencyMode = "local" | "usd";

interface CurrencyContextType {
  mode: CurrencyMode;
  setMode: (mode: CurrencyMode) => void;
  toggleMode: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "currencyDisplayMode";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<CurrencyMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "usd" ? "usd" : "local";
  });

  const setMode = useCallback((next: CurrencyMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: CurrencyMode = prev === "local" ? "usd" : "local";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <CurrencyContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
