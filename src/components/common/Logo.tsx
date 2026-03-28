import { motion } from 'framer-motion';

interface LogoProps {
  height?: number;
}

export function Logo({ height = 32 }: LogoProps) {
  const aspectRatio = 240 / 50;
  const w = height * aspectRatio;

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

      {/* Car silhouette */}
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
        <path
          d="M20 40 L66 40"
          stroke="url(#logoGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="40" r="5" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" />
        <circle cx="72" cy="40" r="5" stroke="url(#logoGrad)" strokeWidth="2.5" fill="none" />
        <path
          d="M8 36 L12 36"
          stroke="url(#logoGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Text: AUTOZAIMI */}
      <motion.text
        x="96"
        y="34"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="22"
        letterSpacing="0.5"
        fill="url(#logoGrad)"
        variants={{
          rest: { opacity: 1 },
          hover: { opacity: 1 },
        }}
      >
        AUTOZAIMI
      </motion.text>

      {/* Glow line under text on hover */}
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
