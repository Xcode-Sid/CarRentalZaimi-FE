import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text, Overlay, Center, Loader, ActionIcon } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAds } from '../../contexts/AdsContext';
import { IconLink } from '@tabler/icons-react';

interface Props {
  position: 'top' | 'bottom';
}

const AUTO_PLAY_MS = 5000;

export function AdBanner({ position }: Props) {
  const { getActiveAds, loading } = useAds();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const ads = getActiveAds(position);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const ad = ads[index];

  // reset when ads change
  useEffect(() => {
    setIndex(0);
  }, [ads.length]);

  // autoplay logic
  useEffect(() => {
    if (!ads.length || paused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, AUTO_PLAY_MS);

    return () => clearInterval(interval);
  }, [ads.length, paused]);

  // reload video on change
  useEffect(() => {
    if (videoRef.current && ad?.videoUrl) {
      videoRef.current.load();
      videoRef.current.play().catch(() => { });
    }
  }, [ad?.videoUrl, index]);

  const media = useMemo(() => {
    const video = ad?.videoUrl?.trim();
    const image = ad?.imageUrl?.trim();

    if (video) return { type: 'video', url: video };
    if (image) return { type: 'image', url: image };
    return null;
  }, [ad]);

  if (loading) {
    return (
      <Center h={position === 'top' ? 280 : 220}>
        <Loader />
      </Center>
    );
  }

  if (!ad) return null;

  const height = position === 'top' ? 280 : 220;

  const goNext = () => setIndex((i) => (i + 1) % ads.length);
  const goPrev = () => setIndex((i) => (i - 1 + ads.length) % ads.length);

  return (
    <Box
      style={{
        position: 'relative',
        height,
        overflow: 'hidden',
        borderRadius: 20,
        cursor: 'pointer',
        background: '#000',
      }}
      onClick={() => ad.linkUrl && navigate(ad.linkUrl)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* TOP FADE (Instagram style) */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))',
          zIndex: 4,
        }}
      />

      {/* PROGRESS BARS (IG STYLE) */}
      <Box
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          display: 'flex',
          gap: 6,
          zIndex: 10,
        }}
      >
        {ads.map((_, i) => (
          <Box
            key={i}
            style={{
              flex: 1,
              height: 3,
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                height: '100%',
                width: i < index ? '100%' : i === index ? '100%' : '0%',
                background: 'white',
                borderRadius: 999,
                transition:
                  i === index
                    ? `width ${AUTO_PLAY_MS}ms linear`
                    : 'none',
              }}
            />
          </Box>
        ))}
      </Box>

      {/* TAP AREAS (invisible but smoother UX) */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 6,
          display: 'flex',
        }}
      >
        <Box
          style={{ flex: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        />
        <Box
          style={{ flex: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        />
      </Box>

      {/* MEDIA WITH SUBTLE ZOOM EFFECT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {media?.type === 'video' ? (
            <video
              ref={videoRef}
              src={media.url}
              muted
              loop
              playsInline
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scale(1.02)',
              }}
            />
          ) : (
            <img
              src={media?.url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scale(1.02)',
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* DARK OVERLAY (SOFT IG STYLE) */}
      <Overlay
        gradient="linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.35) 100%)"
        opacity={1}
        zIndex={2}
      />

      {/* BOTTOM TEXT (GLASS CARD STYLE) */}
      <Box
        style={{
          position: 'absolute',
          bottom: 16,
          left: 12,
          right: 12,
          zIndex: 5,
        }}
      >
        <Box
          style={{
            padding: '12px 14px',
            borderRadius: 14,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <Text size="xs" fw={600} c="white" opacity={0.75}>
            {'Sponsored'}
          </Text>

          <Text size="md" fw={800} c="white" lineClamp={2}>
            {ad.title}
          </Text>
         
        </Box>
      </Box>
    </Box>
  );
}