import React, { useState, createContext, useContext, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { getLiquidGlassColors } from '../utils/sfSymbols';

// iOS 26 Liquid Glass Material Types
export type LiquidGlassMaterial = 'ultraThin' | 'thin' | 'regular' | 'thick';

// Enhanced theme context for iOS 26 Liquid Glass design
interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colorScheme: ColorSchemeName;
  liquidGlassColors: ReturnType<typeof getLiquidGlassColors>;
  setLiquidGlassMaterial: (material: LiquidGlassMaterial) => string;
  isSystemTheme: boolean;
  setSystemTheme: (useSystem: boolean) => void;
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      setColorScheme(newColorScheme);
      if (isSystemTheme) {
        setIsDarkMode(newColorScheme === 'dark');
      }
    });

    // Set initial theme based on system if using system theme
    if (isSystemTheme) {
      const systemColorScheme = Appearance.getColorScheme();
      setIsDarkMode(systemColorScheme === 'dark');
      setColorScheme(systemColorScheme);
    }

    return () => subscription?.remove();
  }, [isSystemTheme]);

  const toggleDarkMode = () => {
    if (isSystemTheme) {
      setIsSystemTheme(false);
    }
    setIsDarkMode(!isDarkMode);
  };

  const setSystemTheme = (useSystem: boolean) => {
    setIsSystemTheme(useSystem);
    if (useSystem) {
      const systemColorScheme = Appearance.getColorScheme();
      setIsDarkMode(systemColorScheme === 'dark');
      setColorScheme(systemColorScheme);
    }
  };

  const liquidGlassColors = getLiquidGlassColors(isDarkMode);

  const setLiquidGlassMaterial = (material: LiquidGlassMaterial): string => {
    switch (material) {
      case 'ultraThin':
        return liquidGlassColors.ultraThinMaterial;
      case 'thin':
        return liquidGlassColors.thinMaterial;
      case 'regular':
        return liquidGlassColors.regularMaterial;
      case 'thick':
        return liquidGlassColors.thickMaterial;
      default:
        return liquidGlassColors.regularMaterial;
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleDarkMode,
      colorScheme,
      liquidGlassColors,
      setLiquidGlassMaterial,
      isSystemTheme,
      setSystemTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 