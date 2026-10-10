export const Colors = {
  // Brand Blues (Deep Royal Blue Palette)
  primary: '#1565C0',       // Deep Blue
  primaryDark: '#0D47A1',   // Darker Royal Blue
  primaryLight: '#1976D2',  // Vibrant Medium Blue
  primaryDeep: '#0A2540',   // Deep Indigo Navy
  
  // Brand Accents (Vibrant Warm Gold & Amber)
  accent: '#FFD600',        // Bright Yellow/Gold
  accentDark: '#F59E0B',    // Warm Amber
  secondary: '#FFD600',     // Alias for accent (Yellow) - backward compat
  
  // Surfaces & Backgrounds
  background: '#F1F5F9',    // Modern neutral slate tint
  backgroundWarm: '#F8FAFC',
  cardBackground: '#FFFFFF',
  white: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',
  surfaceMuted: '#F1F5F9',
  
  // Typography
  text: '#0F172A',          // Deep Slate
  textSecondary: '#334155', // Charcoal slate
  textLight: '#64748B',     // Cool slate muted
  textDisabled: '#94A3B8',  // Subtle hint
  
  // Borders & Dividers
  border: '#E2E8F0',        // Crisp neutral border
  borderLight: '#F1F5F9',   // Very subtle line
  borderBlue: '#BFDBFE',    // Branded soft blue border
  
  // Status Colors
  success: '#16A34A',       // Vibrant Emerald Green
  successLight: '#DCFCE7',  // Light Green surface
  error: '#DC2626',         // Modern Red
  errorLight: '#FEE2E2',    // Light Red surface
  warning: '#D97706',       // Amber warning
  
  // Feature Tokens
  lightBlue: '#EFF6FF',     // Cool ice blue surface
  star: '#F59E0B',          // Rating star amber
  priceGreen: '#16A34A',    // Savings green
  
  // Shadow color
  shadow: 'rgba(15, 23, 42, 0.08)',
};

export const Gradients = {
  primary: ['#0D47A1', '#1565C0', '#1E88E5'] as const,
  primaryHeader: ['#0A2540', '#1565C0'] as const,
  accent: ['#F59E0B', '#FBBF24'] as const,
  goldDeal: ['#D97706', '#F59E0B', '#FBBF24'] as const,
  savings: ['#059669', '#10B981'] as const,
  cardOverlay: ['rgba(13,71,161,0.85)', 'rgba(21,101,192,0.55)', 'transparent'] as const,
};

export const Shadows = {
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 7,
  },
  floating: {
    shadowColor: '#0D47A1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
};