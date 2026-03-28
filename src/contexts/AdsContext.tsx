import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { ads as initialAds, type Ad } from '../data/ads';

interface AdsContextType {
  ads: Ad[];
  addAd: (ad: Ad) => void;
  updateAd: (id: string, updates: Partial<Ad>) => void;
  deleteAd: (id: string) => void;
  getActiveAds: (position: 'top' | 'bottom') => Ad[];
}

const AdsContext = createContext<AdsContextType | null>(null);

export function AdsProvider({ children }: { children: ReactNode }) {
  const [adsList, setAdsList] = useState<Ad[]>(initialAds);

  const addAd = useCallback((ad: Ad) => {
    setAdsList((prev) => [...prev, ad]);
  }, []);

  const updateAd = useCallback((id: string, updates: Partial<Ad>) => {
    setAdsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  }, []);

  const deleteAd = useCallback((id: string) => {
    setAdsList((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getActiveAds = useCallback(
    (position: 'top' | 'bottom') => adsList.filter((a) => a.isActive && a.position === position),
    [adsList],
  );

  return (
    <AdsContext.Provider value={{ ads: adsList, addAd, updateAd, deleteAd, getActiveAds }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
}
