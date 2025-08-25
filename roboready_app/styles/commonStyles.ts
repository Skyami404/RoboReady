import { StyleSheet, Platform } from 'react-native';

export const createCommonStyles = (isDarkMode: boolean) => StyleSheet.create({
  // Common layout styles
  safeArea: { 
    flex: 1, 
    backgroundColor: isDarkMode ? '#121212' : '#fff' 
  },
  container: { 
    paddingHorizontal: 20, 
    backgroundColor: isDarkMode ? '#121212' : '#fff', 
    flex: 1 
  },
  
  // Common title styles
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 0, 
    textAlign: 'center',
    color: isDarkMode ? '#ffffff' : '#000000'
  },
  titleContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  description: {
    fontSize: 14,
    marginBottom: 2,
    color: isDarkMode ? '#9ca3af' : '#6b7280',
  },
  
  // Common shadow styles
  shadow: {
    shadowColor: isDarkMode ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    ...(Platform.OS === 'ios' ? {
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
    } : {}),
    ...(Platform.OS === 'android' ? {
      elevation: 4,
    } : {}),
  },
  
  // Common button styles
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Common input styles
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    backgroundColor: isDarkMode ? '#2d2d2d' : '#f8fafc',
    color: isDarkMode ? '#d1d5db' : '#374151',
  },
  
  // Common card styles
  card: {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
  },
});

// Separate color and spacing constants that can be used across components
export const getCommonColors = (isDarkMode: boolean) => ({
  primary: isDarkMode ? '#3b82f6' : '#1d4ed8',
  secondary: isDarkMode ? '#6b7280' : '#374151',
  background: isDarkMode ? '#121212' : '#ffffff',
  surface: isDarkMode ? '#1f2937' : '#ffffff',
  card: isDarkMode ? '#2d2d2d' : '#f8fafc',
  text: isDarkMode ? '#ffffff' : '#000000',
  textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
  border: isDarkMode ? '#374151' : '#e5e7eb',
  success: '#10b981',
  error: isDarkMode ? '#ef4444' : '#f44336',
  warning: '#f59e0b',
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
}; 