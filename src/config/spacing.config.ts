/**
 * Spacing & Layout Configuration
 * 
 * Spacing system based on 4px base unit
 */

export const spacing = {
  unit: 4, // 4px base unit
  
  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },
  
  // Layout dimensions
  sidebar: {
    collapsed: '64px',
    expanded: '240px',
  },
  
  topbar: '64px',
  
  // Spacing scale (4px increments)
  scale: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
    40: '160px',
    48: '192px',
    64: '256px',
  },
  
  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Spacing = typeof spacing;
