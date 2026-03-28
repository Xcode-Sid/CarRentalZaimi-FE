import { motion } from 'framer-motion';

interface AnimatedDividerProps {
  maxWidth?: number;
  my?: number;
}

export function AnimatedDivider({ maxWidth = 800, my = 0 }: AnimatedDividerProps) {
  return (
    <div style={{ margin: `${my}px auto`, maxWidth, overflow: 'hidden' }}>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="animated-divider"
      />
    </div>
  );
}
