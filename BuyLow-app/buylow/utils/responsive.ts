import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const isSmallScreen = width < 360;
export const isTablet = width >= 768;

export const horizontalPadding = isTablet ? 24 : isSmallScreen ? 12 : 16;

export const productCardWidth = isTablet
  ? 180
  : isSmallScreen
    ? Math.floor(width * 0.42)
    : Math.floor(width * 0.4);

export const productImageHeight = isTablet ? 160 : isSmallScreen ? 120 : 140;

export const sectionTitleSize = isTablet ? 20 : isSmallScreen ? 15 : 17;

export const bottomTabPadding = Platform.OS === 'ios' ? 88 : 72;