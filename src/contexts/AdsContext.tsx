import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { mapToAd, type Ad } from '../data/ads';
import { get } from '../utils/api.utils';

interface AdsContextType {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  refetchAds: () => void;
  getActiveAds: (position: 'top' | 'bottom') => Ad[];
}

const AdsContext = createContext<AdsContextType | null>(null);

export function AdsProvider({ children }: { children: ReactNode }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await get('Ads/getAll');

      if (!res.success) {
        throw new Error(res.message ?? 'Failed to load ads');
      }

      console.log('res.data', res.data);
      setAds((res.data ?? []).map(mapToAd));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ads');
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const getActiveAds = useCallback(
    (position: 'top' | 'bottom') =>
      ads.filter((a) => a.isActive && a.position === position),
    [ads]
  );

  return (
    <AdsContext.Provider
      value={{ ads, loading, error, refetchAds: fetchAds, getActiveAds }}
    >
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
}