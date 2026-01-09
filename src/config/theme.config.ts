/**
 * SolixDB Dashboard Theme Configuration
 * 
 * Brand colors (NON-NEGOTIABLE):
 * - Primary: #1362FD
 * - Secondary: #5A91FF
 * - Gradient: linear-gradient(135deg, #1362FD 0%, #5A91FF 100%)
 */

export const theme = {
  colors: {
    // Brand colors - exact values from logo
    brand: {
      primary: '#1362FD',
      secondary: '#5A91FF',
      gradient: 'linear-gradient(135deg, #1362FD 0%, #5A91FF 100%)',
    },
    
    // Primary color scale
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#5A91FF', // brand-secondary
      500: '#1362FD', // brand-primary
      600: '#0D4FD9',
      700: '#0A3EB5',
      800: '#083094',
      900: '#062573',
    },
    
    // Accent colors
    accent: {
      cyan: '#06B6D4',
      purple: '#8B5CF6',
    },
    
    // Background colors (dark mode first)
    background: {
      base: '#0A0A0B',
      elevated: '#18181B',
      card: '#1F1F23',
    },
    
    // Border colors
    border: {
      subtle: '#27272A',
      default: '#3F3F46',
      strong: '#52525B',
    },
    
    // Text colors
    text: {
      primary: '#FAFAFA',
      secondary: '#A1A1AA',
      tertiary: '#71717A',
      disabled: '#52525B',
    },
    
    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // CSS custom properties for Tailwind
  cssVariables: {
    '--brand-primary': '#1362FD',
    '--brand-secondary': '#5A91FF',
    '--brand-gradient': 'linear-gradient(135deg, #1362FD 0%, #5A91FF 100%)',
    
    '--primary-500': '#1362FD',
    '--primary-600': '#0D4FD9',
    '--primary-700': '#0A3EB5',
    '--primary-400': '#5A91FF',
    '--primary-300': '#7BA9FF',
    
    '--accent-cyan': '#06B6D4',
    '--accent-purple': '#8B5CF6',
    
    '--background-base': '#0A0A0B',
    '--background-elevated': '#18181B',
    '--background-card': '#1F1F23',
    
    '--border-subtle': '#27272A',
    '--border-default': '#3F3F46',
    '--border-strong': '#52525B',
    
    '--text-primary': '#FAFAFA',
    '--text-secondary': '#A1A1AA',
    '--text-tertiary': '#71717A',
    
    '--success': '#10B981',
    '--warning': '#F59E0B',
    '--error': '#EF4444',
  },
} as const;

export type Theme = typeof theme;
