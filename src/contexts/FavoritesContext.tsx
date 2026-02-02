import { createContext, useContext, ReactNode } from "react";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoritesContextType {
  favorites: string[];
  loading: boolean;
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const favoritesData = useFavorites();

  return (
    <FavoritesContext.Provider value={favoritesData}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavoritesContext must be used within a FavoritesProvider");
  }
  return context;
};
