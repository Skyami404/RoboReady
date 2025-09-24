import React, { useState, createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

// Theme context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [userPrefDark, setUserPrefDark] = useState<boolean | null>(null);

  const isDarkMode = userPrefDark ?? (systemScheme === 'dark');

  const toggleDarkMode = () => {
    const next = !(userPrefDark ?? (systemScheme === 'dark'));
    setUserPrefDark(next);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};