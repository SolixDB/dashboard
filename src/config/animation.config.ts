/**
 * Animation Configuration
 * 
 * Framer Motion presets for consistent animations throughout the dashboard
 * ALL interactive elements MUST use these presets
 */

import { Variants } from 'framer-motion';

export const animations = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  pageTransitionConfig: {
    duration: 0.3,
    ease: 'easeInOut' as const,
  },
  
  // Card hover effects
  cardHover: {
    rest: { 
      scale: 1, 
      y: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    },
    hover: { 
      scale: 1.02, 
      y: -4,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  },
  
  // Button press
  buttonTap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  
  // Button hover
  buttonHover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  
  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as Variants,
  
  // Stagger item
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  
  // Number count-up
  counterAnimation: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  
  // Loading skeleton shimmer
  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
  
  // Modal enter/exit
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  
  // Modal backdrop
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  // Toast notification
  toast: {
    initial: { opacity: 0, x: 100, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 100, scale: 0.9 },
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  
  // Sidebar collapse
  sidebar: {
    expanded: { width: '240px' },
    collapsed: { width: '64px' },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  
  // Toggle switch
  toggle: {
    off: { x: 0 },
    on: { x: '100%' },
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
  
  // Chart data entry
  chartData: {
    initial: { opacity: 0, scaleY: 0 },
    animate: { opacity: 1, scaleY: 1 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  
  // Fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 },
  },
  
  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 },
  },
  
  // Checkmark animation (for copy success)
  checkmark: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { 
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  
  // Progress ring
  progressRing: {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 1, ease: 'easeInOut' },
  },
} as const;

export type Animations = typeof animations;
