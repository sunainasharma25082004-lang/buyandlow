export const Colors = {
  primary: '#0F172A', // Sleek dark slate
  secondary: '#FF385C', // Vibrant accent (like Airbnb)
  background: '#F8FAFC', // Very light cool gray
  cardBackground: '#FFFFFF',
  white: '#FFFFFF',
  text: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
  lightBlue: '#F1F5F9', // Subtle surface color
  shadow: 'rgba(0, 0, 0, 0.05)',
};

export const Shadows = {
  small: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};