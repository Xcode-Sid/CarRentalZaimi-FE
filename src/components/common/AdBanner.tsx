import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Text, ActionIcon } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../../contexts/AdsContext';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';

interface Props {
  position: 'top' | 'bottom';
}

const AUTO_PLAY_MS = 5000;

export function AdBanner({ position }: Props) {
  const { getActiveAds } = useAds();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const ads = getActiveAds(position);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  const ad = ads[index];
  const height = position === 'top' ? 320 : 260;

  const goTo = useCallback((i: number) => {
    setVisible(false);
    setTimeout(() => {
      setIndex(i);
      elapsedRef.current = 0;
      startRef.current = null;
      setProgress(0);
      setVisible(true);
    }, 200);
  }, []);

  useEffect(() => {
    setIndex(0);
    elapsedRef.current = 0;
    setProgress(0);
  }, [ads.length]);

  useEffect(() => {
    if (!ads.length) return;
    const tick = (ts: number) => {
      if (!paused) {
        if (!startRef.current) startRef.current = ts;
        elapsedRef.current += ts - startRef.current;
        startRef.current = ts;
        const p = Math.min(elapsedRef.current / AUTO_PLAY_MS, 1);
        setProgress(p);
        if (elapsedRef.current >= AUTO_PLAY_MS) {
          elapsedRef.current = 0;
          startRef.current = null;
          goTo((index + 1) % ads.length);
        }
      } else {
        startRef.current = null;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, ads.length, index, goTo]);

  useEffect(() => {
    if (videoRef.current && ad?.videoUrl) {
      videoRef.current.load();
      videoRef.current.play().catch(() => { });
    }
  }, [ad?.videoUrl, index]);

  if (!ad) return null;

  const media = ad.videoUrl?.trim()
    ? { type: 'video', url: ad.videoUrl }
    : ad.imageUrl?.trim()
      ? { type: 'image', url: ad.imageUrl }
      : null;

  return (
    <Box
      style={{ position: 'relative', height, borderRadius: 20, overflow: 'hidden', background: '#111', cursor: 'pointer', userSelect: 'none' }}
    >
      {/* Progress bars */}
      <Box style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 5, zIndex: 10 }}>
        {ads.map((_, i) => (
          <Box key={i} style={{ flex: 1, height: 2.5, background: 'rgba(255,255,255,0.25)', borderRadius: 999, overflow: 'hidden' }}>
            <Box style={{
              height: '100%',
              width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
              background: '#fff',
              borderRadius: 999,
            }} />
          </Box>
        ))}
      </Box>

      {/* Top-right: pause/play button */}
      <Box style={{ position: 'absolute', top: 30, right: 12, zIndex: 11 }}>
        <ActionIcon
          variant="transparent"
          onClick={(e) => {
            e.stopPropagation();
            setPaused(p => !p);
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {paused
            ? <IconPlayerPlay size={14} color="white" fill="white" />
            : <IconPlayerPause size={14} color="white" fill="white" />
          }
        </ActionIcon>
      </Box>

      {/* Sponsored label */}
      <Box style={{ position: 'absolute', top: 38, left: 14, zIndex: 10 }}>
        <Text size="xs" fw={500} c="white" style={{ opacity: 0.7, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
          Sponsored
        </Text>
      </Box>

      {/* Tap areas */}
      <Box style={{ position: 'absolute', inset: 0, zIndex: 9, display: 'flex' }}>
        <Box style={{ flex: 1 }} onClick={e => { e.stopPropagation(); goTo((index - 1 + ads.length) % ads.length); }} />
        <Box style={{ flex: 1 }} onClick={e => { e.stopPropagation(); goTo((index + 1) % ads.length); }} />
      </Box>

      {/* Media */}
      <Box style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }}>
        {media?.type === 'video' ? (
          <video
            ref={videoRef}
            src={media.url}
            muted
            loop
            playsInline
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.02)' }}
          />
        ) : (
          <img
            src={media?.url}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.02)' }}
          />
        )}
      </Box>

      {/* Gradient overlay */}
      <Box style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.72) 100%)'
      }} />


      {/* Bottom content */}
      <Box style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '16px 16px 20px' }}>
        <Text fw={500} size="lg" c="white" lineClamp={2} mb={ad.linkUrl ? 12 : 0}>
          {ad.title}
        </Text>

        {ad.linkUrl && (
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 999,
              padding: '7px 16px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(ad.linkUrl);
            }}
          >
            <Text size="sm" fw={500} c="white">Learn more</Text>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        )}
      </Box>

      {ads.length > 1 && (
        <Box style={{
          position: 'absolute',
          bottom: 68,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          zIndex: 11,
        }}>
          {ads.map((_, i) => (
            <Box
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 999,
                background: i === index ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.25s',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}