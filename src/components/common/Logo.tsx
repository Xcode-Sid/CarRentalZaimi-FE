import { motion } from 'framer-motion';
import { toImagePath } from '../../utils/general';

interface LogoProps {
  height?: number;
  logoUrl?: string;
}

export function Logo({ height = 32, logoUrl }: LogoProps) {
  const aspectRatio = 240 / 50;
  const w = height * aspectRatio;

  if (logoUrl) {
    return (
      <motion.div
        style={{
          width: 150,
          height: 90,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -5,
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <img
          src={toImagePath(logoUrl)}
          style={{
            maxHeight: 120,
            maxWidth: 150,
            width: 'auto',
            height: 'auto',
            display: 'block',
            mixBlendMode: 'screen',
            margin: '-10px',
          }}
          alt="Logo"
        />
      </motion.div>
    );
  }
  return (
    <motion.svg
      viewBox="0 0 240 50"
      width={w}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2DD4A8" />
          <stop offset="100%" stopColor="#00897B" />
        </linearGradient>
      </defs>

      <motion.g
        variants={{
          rest: { x: 0 },
          hover: { x: 3 },
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <path
          d="M8 32 C8 32 12 28 18 26 L30 18 C32 16 36 14 42 14 L62 14 C66 14 70 16 72 18 L78 26 C82 27 86 30 86 32 L86 36 C86 38 84 40 82 40 L76 40"
          stroke="url(#logoGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M20 40 L66 40" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="18" cy="40" r="5" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" />
        <circle cx="72" cy="40" r="5" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" />
        <path d="M8 36 L12 36" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>

      <motion.rect
        x="96"
        y="39"
        rx="1"
        height="2"
        fill="url(#logoGrad)"
        variants={{
          rest: { width: 0, opacity: 0 },
          hover: { width: 130, opacity: 0.6 },
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      />
    </motion.svg>
  );
}