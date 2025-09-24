export type SymbolName =
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

export const SFSymbols: Record<SymbolName, SymbolName> = {
  home: 'home',
  trophy: 'trophy',
  clipboard: 'clipboard',
  calendar: 'calendar',
  plus: 'plus',
  delete: 'delete',
  checkmark: 'checkmark',
  warning: 'warning',
  info: 'info',
  sun: 'sun',
  moon: 'moon',
  close: 'close',
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