import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (vehicleId: number) => void;
  isFavorite: (vehicleId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('az-favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [1, 3, 8];
      }
    }
    return [1, 3, 8];
  });

  const toggleFavorite = useCallback((vehicleId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId];
      localStorage.setItem('az-favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (vehicleId: number) => favorites.includes(vehicleId),
    [favorites],
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
