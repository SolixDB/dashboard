/**
 * Component Style Guide
 * 
 * Standardized component styles for consistent UI
 */

import { theme } from './theme.config';
import { spacing } from './spacing.config';

export const components = {
  card: {
    background: theme.colors.background.card,
    border: `1px solid ${theme.colors.border.subtle}`,
    borderRadius: '12px',
    padding: spacing.scale[6], // 24px
    shadow: '0 1px 3px rgba(0,0,0,0.3)',
    hoverShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  
  button: {
    primary: {
      background: theme.colors.brand.gradient,
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.colors.text.primary,
      hover: {
        scale: 1.02,
        boxShadow: '0 4px 12px rgba(19, 98, 253, 0.4)',
      },
    },
    secondary: {
      background: theme.colors.background.elevated,
      border: `1px solid ${theme.colors.border.subtle}`,
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: theme.colors.text.primary,
      hover: {
        background: theme.colors.background.card,
        borderColor: theme.colors.border.default,
      },
    },
    ghost: {
      background: 'transparent',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: theme.colors.text.secondary,
      hover: {
        background: theme.colors.background.elevated,
        color: theme.colors.text.primary,
      },
    },
  },
  
  input: {
    background: theme.colors.background.elevated,
    border: `1px solid ${theme.colors.border.subtle}`,
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '0.875rem',
    color: theme.colors.text.primary,
    placeholder: theme.colors.text.tertiary,
    focus: {
      border: `2px solid ${theme.colors.brand.primary}`,
      outline: 'none',
      boxShadow: `0 0 0 3px rgba(19, 98, 253, 0.1)`,
    },
  },
  
  badge: {
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 500,
    variants: {
      default: {
        background: theme.colors.background.elevated,
        color: theme.colors.text.secondary,
      },
      success: {
        background: `${theme.colors.success}20`,
        color: theme.colors.success,
      },
      warning: {
        background: `${theme.colors.warning}20`,
        color: theme.colors.warning,
      },
      error: {
        background: `${theme.colors.error}20`,
        color: theme.colors.error,
      },
      primary: {
        background: `${theme.colors.brand.primary}20`,
        color: theme.colors.brand.primary,
      },
    },
  },
  
  sidebar: {
    background: theme.colors.background.elevated,
    border: `1px solid ${theme.colors.border.subtle}`,
    width: {
      expanded: spacing.sidebar.expanded,
      collapsed: spacing.sidebar.collapsed,
    },
  },
  
  topbar: {
    height: spacing.topbar,
    background: theme.colors.background.elevated,
    border: `1px solid ${theme.colors.border.subtle}`,
  },
  
  modal: {
    overlay: {
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
    },
    content: {
      background: theme.colors.background.card,
      borderRadius: '16px',
      padding: spacing.scale[6], // 24px
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    },
  },
  
  skeleton: {
    background: theme.colors.background.elevated,
    borderRadius: '8px',
    shimmer: {
      background: `linear-gradient(
        90deg,
        ${theme.colors.background.elevated} 0%,
        ${theme.colors.background.card} 50%,
        ${theme.colors.background.elevated} 100%
      )`,
      backgroundSize: '200% 100%',
    },
  },
  
  table: {
    background: theme.colors.background.card,
    border: `1px solid ${theme.colors.border.subtle}`,
    borderRadius: '12px',
    header: {
      background: theme.colors.background.elevated,
      padding: spacing.scale[4], // 16px
      fontSize: '0.75rem',
      fontWeight: 600,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    cell: {
      padding: spacing.scale[4], // 16px
      fontSize: '0.875rem',
      color: theme.colors.text.primary,
      borderTop: `1px solid ${theme.colors.border.subtle}`,
    },
  },
  
  chart: {
    grid: {
      stroke: theme.colors.border.subtle,
      strokeWidth: 1,
    },
    axis: {
      stroke: theme.colors.text.tertiary,
      fontSize: '0.75rem',
    },
    tooltip: {
      background: theme.colors.background.card,
      border: `1px solid ${theme.colors.border.subtle}`,
      borderRadius: '8px',
      padding: spacing.scale[2], // 8px
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
  },
} as const;

export type Components = typeof components;
