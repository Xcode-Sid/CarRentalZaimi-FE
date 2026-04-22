import type { Variants, Transition } from 'framer-motion';

export const springTransition: Transition = {
    type: 'spring', stiffness: 300, damping: 22,
};

export const smoothEase = [0.25, 0.1, 0.25, 1] as const;

export const cardHover3d = {
    whileHover: { y: -8, rotateX: 2, rotateY: -2, boxShadow: '0 24px 48px rgba(0,0,0,0.15)' },
    whileTap: { scale: 0.98 },
    transition: springTransition,
    style: { transformStyle: 'preserve-3d' as const, perspective: 1000 },
};

export const iconSpin = {
    whileHover: { rotate: 20, scale: 1.15 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 12 },
};

export const buttonPop = {
    whileHover: { scale: 1.06, y: -2 },
    whileTap: { scale: 0.94 },
    transition: springTransition,
};

export const pulseGlow: Variants = {
    animate: {
        boxShadow: [
            '0 0 0 0 rgba(45, 212, 168, 0)',
            '0 0 0 8px rgba(45, 212, 168, 0.15)',
            '0 0 0 0 rgba(45, 212, 168, 0)',
        ],
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
};

export const floatingAnimation: Variants = {
    animate: {
        y: [0, -6, 0],
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
};

export const listItemSlide = (i: number, direction: 'left' | 'right' = 'left'): object => ({
    initial: { opacity: 0, x: direction === 'left' ? -20 : 20, y: 6 },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { delay: i * 0.07, duration: 0.4, ease: smoothEase },
});

export const chartContainerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: {
        opacity: 1, scale: 1, y: 0,
        transition: { duration: 0.6, ease: smoothEase },
    },
};

export const progressBarVariants: Variants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
        scaleX: 1,
        transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
    },
};

export const emptyStateFloat = {
    animate: { y: [0, -8, 0], rotate: [0, 3, -3, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
};

export const skeletonPulse: Variants = {
    animate: {
        opacity: [0.4, 1, 0.4],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
};

export const badgePopIn = (delay: number): object => ({
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { delay, type: 'spring', stiffness: 500, damping: 20 },
});

export const countUpDuration = 1500;
