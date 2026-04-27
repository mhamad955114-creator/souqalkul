import { useCallback } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

/**
 * Returns a price formatter that respects the user's currency display preference.
 * When mode is "usd", the same number is shown with "$" symbol.
 * When mode is "local", the original currency symbol is used.
 */
export function useFormatPrice() {
  const { mode } = useCurrency();

  const formatDisplayPrice = useCallback(
    (price: number, localCurrencySymbol?: string): string => {
      const symbol = mode === "usd" ? "$" : (localCurrencySymbol || "ل.س");
      return (
        new Intl.NumberFormat("en-US", {
          style: "decimal",
          maximumFractionDigits: 0,
        }).format(price) +
        " " +
        symbol
      );
    },
    [mode]
  );

  return { formatDisplayPrice, mode };
}
