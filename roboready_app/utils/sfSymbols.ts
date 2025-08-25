import { Ionicons } from '@expo/vector-icons';

export const SFSymbols = {
  // Navigation icons
  home: 'home' as keyof typeof Ionicons.glyphMap,
  trophy: 'trophy' as keyof typeof Ionicons.glyphMap,
  clipboard: 'clipboard' as keyof typeof Ionicons.glyphMap,
  calendar: 'calendar' as keyof typeof Ionicons.glyphMap,
  
  // Action icons
  plus: 'add' as keyof typeof Ionicons.glyphMap,
  delete: 'trash' as keyof typeof Ionicons.glyphMap,
  calendarPlus: 'calendar' as keyof typeof Ionicons.glyphMap,
  
  // Status icons
  checkmark: 'checkmark' as keyof typeof Ionicons.glyphMap,
  warning: 'warning' as keyof typeof Ionicons.glyphMap,
  info: 'information-circle' as keyof typeof Ionicons.glyphMap,
};

export const getIconColor = (isDarkMode: boolean, type: 'primary' | 'secondary' | 'success' | 'error' = 'primary') => {
  switch (type) {
    case 'primary':
      return isDarkMode ? '#3b82f6' : '#1d4ed8';
    case 'secondary':
      return isDarkMode ? '#9ca3af' : '#6b7280';
    case 'success':
      return '#10b981';
    case 'error':
      return isDarkMode ? '#ef4444' : '#f44336';
    default:
      return isDarkMode ? '#ffffff' : '#000000';
  }
};

export const getIconSize = (size: 'small' | 'medium' | 'large' = 'medium') => {
  switch (size) {
    case 'small':
      return 16;
    case 'medium':
      return 24;
    case 'large':
      return 32;
    default:
      return 24;
  }
}; 