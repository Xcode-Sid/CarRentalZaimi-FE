import { type ReactNode } from 'react';
import { motion, type Variant } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface AnimatedSectionProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  stagger?: number;
  once?: boolean;
  amount?: number;
  scale?: boolean;
}

const directionOffset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

export function AnimatedSection({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className,
  style,
  once = true,
  amount = 0.2,
  scale = false,
}: AnimatedSectionProps) {
  const offset = directionOffset[direction];

  const hidden: Variant = {
    opacity: 0,
    x: offset.x,
    y: offset.y,
    ...(scale && { scale: 0.95 }),
  };

  const visible: Variant = {
    opacity: 1,
    x: 0,
    y: 0,
    ...(scale && { scale: 1 }),
  };

  return (
    <motion.div
      initial={hidden}
      whileInView={visible}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
  amount?: number;
}

export function StaggerContainer({
  children,
  stagger = 0.1,
  delay = 0,
  className,
  style,
  once = true,
  amount = 0.15,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  direction?: Direction;
  className?: string;
  style?: React.CSSProperties;
  scale?: boolean;
}

export function StaggerItem({
  children,
  direction = 'up',
  className,
  style,
  scale = false,
}: StaggerItemProps) {
  const offset = directionOffset[direction];

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          x: offset.x,
          y: offset.y,
          ...(scale && { scale: 0.95 }),
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          ...(scale && { scale: 1 }),
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
