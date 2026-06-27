export const Colors = {
  primary: '#1565C0',       // Deep Blue
  primaryDark: '#0D47A1',   // Darker Blue
  primaryLight: '#1976D2',  // Medium Blue
  accent: '#FFD600',        // Bright Yellow
  accentDark: '#F9A825',    // Amber/Dark Yellow
  secondary: '#FFD600',     // Alias for accent (Yellow) - for backward compat
  background: '#F0F4FF',    // Very light blue-white
  cardBackground: '#FFFFFF',
  white: '#FFFFFF',
  text: '#0D1B2A',          // Near-black blue-tinted
  textLight: '#5B7A99',     // Muted blue-grey
  border: '#BBDEFB',        // Light blue border
  success: '#2E7D32',
  error: '#C62828',
  lightBlue: '#E3F2FD',     // Very light blue surface
  shadow: 'rgba(21, 101, 192, 0.12)',
};

export const Shadows = {
  small: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};