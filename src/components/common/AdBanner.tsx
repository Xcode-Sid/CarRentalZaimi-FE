import { useRef, useEffect } from 'react';
import { Box, Text, Overlay } from '@mantine/core';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAds } from '../../contexts/AdsContext';

interface Props {
  position: 'top' | 'bottom';
}

export function AdBanner({ position }: Props) {
  const { getActiveAds } = useAds();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeAds = getActiveAds(position);
  const ad = activeAds[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [ad]);

  if (!ad) return null;

  const height = position === 'top' ? 280 : 220;

  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Box
        style={{
          position: 'relative',
          height,
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => navigate(ad.linkUrl)}
      >
        {ad.videoUrl ? (
          <video
            ref={videoRef}
            src={ad.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        <Overlay
          gradient="linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)"
          opacity={1}
          zIndex={1}
        />

        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1.5rem 2rem',
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              c="white"
              style={{ letterSpacing: '0.1em', opacity: 0.7, marginBottom: 4 }}
            >
              {position === 'top' ? 'Featured Offer' : 'Special Deal'}
            </Text>
            <Text
              size="xl"
              fw={800}
              c="white"
              style={{ lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              {ad.title}
            </Text>
          </motion.div>
        </Box>

        {/* Subtle teal accent line at the bottom */}
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #2DD4A8, transparent)',
            zIndex: 3,
          }}
        />
      </Box>
    </motion.div>
  );
}
