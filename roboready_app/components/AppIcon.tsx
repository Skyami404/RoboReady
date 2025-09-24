import React from 'react';
import { Platform, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AppIconName =
  | 'home'
  | 'trophy'
  | 'clipboard'
  | 'calendar'
  | 'plus'
  | 'delete'
  | 'checkmark'
  | 'warning'
  | 'info'
  | 'sun'
  | 'moon'
  | 'close';

type AppIconVariant = 'auto' | 'filled' | 'outline';

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  focused?: boolean;
  variant?: AppIconVariant;
  style?: StyleProp<ViewStyle | TextStyle>;
}

const ioniconBaseMap: Record<AppIconName, string> = {
  home: 'home',
  trophy: 'trophy',
  clipboard: 'clipboard',
  calendar: 'calendar',
  plus: 'add',
  delete: 'trash',
  checkmark: 'checkmark',
  warning: 'warning',
  info: 'information-circle',
  sun: 'sunny',
  moon: 'moon',
  close: 'close',
};

function getIoniconName(name: AppIconName, variant: AppIconVariant, focused?: boolean): keyof typeof Ionicons.glyphMap {
  const base = ioniconBaseMap[name];
  const useFilled = variant === 'filled' || (variant === 'auto' && focused);
  // Ionicons filled is base name, outline is `${base}-outline`
  const candidate = useFilled ? base : `${base}-outline`;
  // Type assertion because glyphMap keys are string literals; fall back to base if outline missing
  return (Ionicons.glyphMap as Record<string, number>)[candidate] ? (candidate as keyof typeof Ionicons.glyphMap) : (base as keyof typeof Ionicons.glyphMap);
}

export const AppIcon: React.FC<AppIconProps> = ({ name, size = 24, color, focused, variant = 'auto', style }) => {
  const ionName = getIoniconName(name, Platform.OS === 'ios' ? variant : 'filled', focused);
  return <Ionicons name={ionName} size={size} color={color} style={style} />;
};

export default AppIcon;

