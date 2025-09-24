import { StyleSheet, Platform } from 'react-native';
import { getLiquidGlassColors } from '../utils/sfSymbols';

export const createCommonStyles = (isDarkMode: boolean) => {
  const glassColors = getLiquidGlassColors(isDarkMode);
  
  return StyleSheet.create({
    // Common layout styles with Liquid Glass
    safeArea: { 
      flex: 1, 
      backgroundColor: glassColors.systemBackground
    },
    container: { 
      paddingHorizontal: 20, 
      backgroundColor: glassColors.systemBackground, 
      flex: 1 
    },
    
    // Liquid Glass background containers
    glassContainer: {
      flex: 1,
      backgroundColor: glassColors.regularMaterial,
      borderRadius: 20,
      overflow: 'hidden',
    },
    
    // Common title styles with iOS 26 typography
    title: { 
      fontSize: 32, 
      fontWeight: '700', // iOS 26 bold weight
      marginBottom: 0, 
      textAlign: 'center',
      color: glassColors.label,
      letterSpacing: -0.5, // iOS 26 tight letter spacing for large text
    },
    titleContainer: {
      marginTop: 24,
      marginBottom: 24,
      paddingTop: 0,
      paddingBottom: 0,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      color: glassColors.label,
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 16,
      marginBottom: 4,
      color: glassColors.secondaryLabel,
      lineHeight: 22, // iOS 26 improved line height
    },
    
    // iOS 26 Liquid Glass shadow styles
    glassElevation: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      ...(Platform.OS === 'ios' ? {
        shadowOpacity: isDarkMode ? 0.4 : 0.15,
        shadowRadius: 12,
      } : {}),
      ...(Platform.OS === 'android' ? {
        elevation: 8,
      } : {}),
    },
    
    lightShadow: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      ...(Platform.OS === 'ios' ? {
        shadowOpacity: isDarkMode ? 0.2 : 0.08,
        shadowRadius: 6,
      } : {}),
      ...(Platform.OS === 'android' ? {
        elevation: 3,
      } : {}),
    },
    
    // iOS 26 Liquid Glass button styles
    glassButton: {
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: glassColors.regularMaterial,
      borderWidth: 0.5,
      borderColor: glassColors.separator,
      minHeight: 50,
    },
    
    primaryButton: {
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      minHeight: 50,
    },
    
    secondaryButton: {
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: glassColors.secondarySystemBackground,
      borderWidth: 0.5,
      borderColor: glassColors.separator,
      minHeight: 50,
    },
    
    // iOS 26 Liquid Glass input styles
    glassInput: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      fontSize: 17, // iOS 26 standard text size
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: glassColors.separator,
      backgroundColor: glassColors.secondarySystemBackground,
      color: glassColors.label,
      minHeight: 50,
    },
    
    // iOS 26 Liquid Glass card styles
    glassCard: {
      backgroundColor: glassColors.regularMaterial,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 0.5,
      borderColor: glassColors.separator,
      overflow: 'hidden',
    },
    
    thinGlassCard: {
      backgroundColor: glassColors.thinMaterial,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: glassColors.separator,
      overflow: 'hidden',
    },
    
    ultraThinGlassCard: {
      backgroundColor: glassColors.ultraThinMaterial,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 0.5,
      borderColor: glassColors.separator,
      overflow: 'hidden',
    },
  });
};

// iOS 26 Liquid Glass color system
export const getCommonColors = (isDarkMode: boolean) => {
  const glassColors = getLiquidGlassColors(isDarkMode);
  
  return {
    // iOS 26 system colors
    primary: '#007AFF',
    secondary: '#8E8E93',
    success: '#32D74B',
    error: '#FF453A',
    warning: '#FF9F0A',
    accent: '#5E5CE6',
    
    // Background colors
    background: glassColors.systemBackground,
    secondaryBackground: glassColors.secondarySystemBackground,
    tertiaryBackground: glassColors.tertiarySystemBackground,
    
    // Glass materials
    ultraThinMaterial: glassColors.ultraThinMaterial,
    thinMaterial: glassColors.thinMaterial,
    regularMaterial: glassColors.regularMaterial,
    thickMaterial: glassColors.thickMaterial,
    
    // Text colors
    label: glassColors.label,
    secondaryLabel: glassColors.secondaryLabel,
    tertiaryLabel: glassColors.tertiaryLabel,
    
    // Separator colors
    separator: glassColors.separator,
    opaqueSeparator: glassColors.opaqueSeparator,
  };
};

// iOS 26 spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

// iOS 26 border radius system
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,
};

// iOS 26 typography system
export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '400' as const,
    letterSpacing: -0.5,
  },
  title1: {
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: -0.3,
  },
  title2: {
    fontSize: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  title3: {
    fontSize: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
}; 