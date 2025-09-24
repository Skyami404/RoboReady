import { Ionicons } from '@expo/vector-icons';

export const SFSymbols = {
  // Navigation icons - iOS 26 Liquid Glass compatible
  home: 'home-outline' as keyof typeof Ionicons.glyphMap,
  homeActive: 'home' as keyof typeof Ionicons.glyphMap,
  trophy: 'trophy-outline' as keyof typeof Ionicons.glyphMap,
  trophyActive: 'trophy' as keyof typeof Ionicons.glyphMap,
  clipboard: 'clipboard-outline' as keyof typeof Ionicons.glyphMap,
  clipboardActive: 'clipboard' as keyof typeof Ionicons.glyphMap,
  calendar: 'calendar-outline' as keyof typeof Ionicons.glyphMap,
  calendarActive: 'calendar' as keyof typeof Ionicons.glyphMap,
  
  // Action icons - Enhanced for Liquid Glass
  plus: 'add-circle-outline' as keyof typeof Ionicons.glyphMap,
  plusActive: 'add-circle' as keyof typeof Ionicons.glyphMap,
  delete: 'trash-outline' as keyof typeof Ionicons.glyphMap,
  deleteActive: 'trash' as keyof typeof Ionicons.glyphMap,
  calendarPlus: 'calendar-outline' as keyof typeof Ionicons.glyphMap,
  edit: 'create-outline' as keyof typeof Ionicons.glyphMap,
  editActive: 'create' as keyof typeof Ionicons.glyphMap,
  
  // Status icons - iOS 26 style
  checkmark: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
  checkmarkActive: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
  warning: 'warning-outline' as keyof typeof Ionicons.glyphMap,
  warningActive: 'warning' as keyof typeof Ionicons.glyphMap,
  info: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
  infoActive: 'information-circle' as keyof typeof Ionicons.glyphMap,
  
  // Theme icons - Liquid Glass style
  sun: 'sunny-outline' as keyof typeof Ionicons.glyphMap,
  moon: 'moon-outline' as keyof typeof Ionicons.glyphMap,
  
  // Additional iOS 26 icons
  settings: 'settings-outline' as keyof typeof Ionicons.glyphMap,
  settingsActive: 'settings' as keyof typeof Ionicons.glyphMap,
  notification: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
  notificationActive: 'notifications' as keyof typeof Ionicons.glyphMap,
  share: 'share-outline' as keyof typeof Ionicons.glyphMap,
  shareActive: 'share' as keyof typeof Ionicons.glyphMap,
};

// iOS 26 Liquid Glass color system
export const getIconColor = (
  isDarkMode: boolean, 
  type: 'primary' | 'secondary' | 'success' | 'error' | 'glass' | 'accent' = 'primary',
  opacity: number = 1.0
) => {
  const colors = {
    primary: isDarkMode ? '#007AFF' : '#007AFF', // iOS 26 system blue
    secondary: isDarkMode ? '#8E8E93' : '#8E8E93', // iOS 26 system gray
    success: isDarkMode ? '#32D74B' : '#32D74B', // iOS 26 system green
    error: isDarkMode ? '#FF453A' : '#FF453A', // iOS 26 system red
    glass: isDarkMode ? '#FFFFFF' : '#000000', // For glass overlay effects
    accent: isDarkMode ? '#5E5CE6' : '#5E5CE6', // iOS 26 system purple
  };
  
  const baseColor = colors[type] || (isDarkMode ? '#FFFFFF' : '#000000');
  
  // Return color with opacity for glass effects
  if (opacity < 1.0) {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return baseColor;
};

export const getIconSize = (size: 'xs' | 'small' | 'medium' | 'large' | 'xl' = 'medium') => {
  switch (size) {
    case 'xs':
      return 14;
    case 'small':
      return 18;
    case 'medium':
      return 24;
    case 'large':
      return 32;
    case 'xl':
      return 40;
    default:
      return 24;
  }
};

// iOS 26 Liquid Glass material colors
export const getLiquidGlassColors = (isDarkMode: boolean) => ({
  // Glass materials
  ultraThinMaterial: isDarkMode ? 'rgba(28, 28, 30, 0.68)' : 'rgba(255, 255, 255, 0.68)',
  thinMaterial: isDarkMode ? 'rgba(28, 28, 30, 0.78)' : 'rgba(255, 255, 255, 0.78)',
  regularMaterial: isDarkMode ? 'rgba(28, 28, 30, 0.88)' : 'rgba(255, 255, 255, 0.88)',
  thickMaterial: isDarkMode ? 'rgba(28, 28, 30, 0.94)' : 'rgba(255, 255, 255, 0.94)',
  
  // System colors with glass compatibility
  systemBackground: isDarkMode ? '#000000' : '#FFFFFF',
  secondarySystemBackground: isDarkMode ? '#1C1C1E' : '#F2F2F7',
  tertiarySystemBackground: isDarkMode ? '#2C2C2E' : '#FFFFFF',
  
  // Label colors
  label: isDarkMode ? '#FFFFFF' : '#000000',
  secondaryLabel: isDarkMode ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
  tertiaryLabel: isDarkMode ? 'rgba(235, 235, 245, 0.3)' : 'rgba(60, 60, 67, 0.3)',
  
  // Separator colors
  separator: isDarkMode ? 'rgba(84, 84, 88, 0.6)' : 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: isDarkMode ? '#38383A' : '#C6C6C8',
}); 