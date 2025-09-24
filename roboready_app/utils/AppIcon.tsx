import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AppIconName =
  | 'home'
  | 'trophy'
  | 'clipboard'
  | 'calendar'
  | 'calendarPlus'
  | 'plus'
  | 'delete'
  | 'checkmark'
  | 'warning'
  | 'info'
  | 'sun'
  | 'moon'
  | 'close';

function getIoniconName(
  name: AppIconName,
  focused?: boolean
): keyof typeof Ionicons.glyphMap {
  switch (name) {
    case 'home':
      return (focused ? 'home' : 'home-outline') as keyof typeof Ionicons.glyphMap;
    case 'trophy':
      return (focused ? 'trophy' : 'trophy-outline') as keyof typeof Ionicons.glyphMap;
    case 'clipboard':
      return (focused ? 'clipboard' : 'clipboard-outline') as keyof typeof Ionicons.glyphMap;
    case 'calendar':
      return (focused ? 'calendar' : 'calendar-outline') as keyof typeof Ionicons.glyphMap;
    case 'calendarPlus':
      return (focused ? 'calendar' : 'calendar-outline') as keyof typeof Ionicons.glyphMap;
    case 'plus':
      return (focused ? 'add-circle' : 'add-circle-outline') as keyof typeof Ionicons.glyphMap;
    case 'delete':
      return (focused ? 'trash' : 'trash-outline') as keyof typeof Ionicons.glyphMap;
    case 'checkmark':
      return (focused ? 'checkmark-circle' : 'checkmark-circle-outline') as keyof typeof Ionicons.glyphMap;
    case 'warning':
      return (focused ? 'warning' : 'warning-outline') as keyof typeof Ionicons.glyphMap;
    case 'info':
      return (focused ? 'information-circle' : 'information-circle-outline') as keyof typeof Ionicons.glyphMap;
    case 'sun':
      return (focused ? 'sunny' : 'sunny-outline') as keyof typeof Ionicons.glyphMap;
    case 'moon':
      return (focused ? 'moon' : 'moon-outline') as keyof typeof Ionicons.glyphMap;
    case 'close':
      return 'close' as keyof typeof Ionicons.glyphMap;
    default:
      return 'ellipse' as keyof typeof Ionicons.glyphMap;
  }
}

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
  focused?: boolean;
};

export const AppIcon: React.FC<AppIconProps> = ({ name, size = 24, color, focused }) => {
  // For now, render Ionicons cross-platform. This wrapper allows us to switch to
  // native SF Symbols on iOS in the future without changing usages.
  const iconName = getIoniconName(name, focused);
  return <Ionicons name={iconName} size={size} color={color} />;
};

export default AppIcon;

