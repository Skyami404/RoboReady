import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, IconButton } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Platform, BlurView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SFSymbols, getIconColor, getLiquidGlassColors } from './utils/sfSymbols';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import TournamentDayScreen from './screens/TournamentDayScreen';
import WeekBeforeScreen from './screens/WeekBeforeScreen';
import TournamentsScreen from './screens/TournamentsScreen';


const Tab = createBottomTabNavigator();

const createLiquidGlassTheme = (isDarkMode: boolean) => {
  const glassColors = getLiquidGlassColors(isDarkMode);
  const baseTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: '#007AFF',
      outline: glassColors.separator,
      onSurface: glassColors.label,
      background: glassColors.systemBackground,
      surface: glassColors.regularMaterial,
      surfaceVariant: glassColors.secondarySystemBackground,
      onSurfaceVariant: glassColors.secondaryLabel,
      card: glassColors.tertiarySystemBackground,
      text: glassColors.label,
      border: glassColors.separator,
      notification: '#FF453A',
      // Additional iOS 26 colors
      secondaryBackground: glassColors.secondarySystemBackground,
      tertiaryBackground: glassColors.tertiarySystemBackground,
      ultraThinMaterial: glassColors.ultraThinMaterial,
      thinMaterial: glassColors.thinMaterial,
      regularMaterial: glassColors.regularMaterial,
      thickMaterial: glassColors.thickMaterial,
    },
  };
};

function AppContent() {
  const { isDarkMode, toggleDarkMode, liquidGlassColors, setLiquidGlassMaterial } = useTheme();
  const paperTheme = createLiquidGlassTheme(isDarkMode);
  
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.regularMaterial,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.notification,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '600' as const },
      heavy: { fontFamily: 'System', fontWeight: '700' as const },
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar 
            style={isDarkMode ? 'light' : 'dark'} 
            translucent={true} 
            backgroundColor="transparent"
          />
          <Tab.Navigator
            id={undefined}
            screenOptions={({ route }) => ({
              headerShown: true,
              headerTitle: '',
              headerTransparent: true,
              headerBlurEffect: isDarkMode ? 'dark' : 'light',
              headerStyle: {
                backgroundColor: setLiquidGlassMaterial('regular'),
                ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
                ...(Platform.OS === 'ios' ? { 
                  shadowOpacity: 0,
                  borderBottomWidth: 0.5,
                  borderBottomColor: liquidGlassColors.separator,
                } : {}),
              },
              headerSafeAreaInsets: { top: 0 },
              headerTintColor: liquidGlassColors.label,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 17,
              },
              headerRight: () => (
                <IconButton
                  icon={isDarkMode ? SFSymbols.sun : SFSymbols.moon}
                  iconColor={getIconColor(isDarkMode, 'primary')}
                  size={22}
                  onPress={toggleDarkMode}
                  style={{ marginRight: 8 }}
                />
              ),
              // iOS 26 Liquid Glass Tab Bar
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: liquidGlassColors.secondaryLabel,
              tabBarStyle: {
                backgroundColor: setLiquidGlassMaterial('thick'),
                borderTopWidth: 0.5,
                borderTopColor: liquidGlassColors.separator,
                ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
                ...(Platform.OS === 'ios' ? { 
                  shadowOpacity: 0,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                } : {}),
                height: Platform.OS === 'ios' ? 88 : 80,
                paddingBottom: Platform.OS === 'ios' ? 24 : 16,
                paddingTop: 12,
                paddingHorizontal: 16,
              },
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '500',
                marginTop: 4,
              },
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
                
                if (route.name === 'Home') {
                  iconName = focused ? SFSymbols.homeActive : SFSymbols.home;
                } else if (route.name === 'Tournament Day') {
                  iconName = focused ? SFSymbols.trophyActive : SFSymbols.trophy;
                } else if (route.name === 'Week Before') {
                  iconName = focused ? SFSymbols.clipboardActive : SFSymbols.clipboard;
                } else if (route.name === 'Tournaments') {
                  iconName = focused ? SFSymbols.calendarActive : SFSymbols.calendar;
                }
                
                return (
                  <Ionicons 
                    name={iconName} 
                    size={focused ? 26 : 24} 
                    color={color}
                    style={{ 
                      marginBottom: Platform.OS === 'ios' ? 2 : 0,
                    }}
                  />
                );
              },
            })}
          >
              <Tab.Screen 
                name="Home" 
                component={HomeScreen}
              />
              <Tab.Screen 
                name="Tournament Day" 
                component={TournamentDayScreen}
              />
              <Tab.Screen 
                name="Week Before" 
                component={WeekBeforeScreen}
              />
              <Tab.Screen 
                name="Tournaments" 
                component={TournamentsScreen}
              />
            </Tab.Navigator>
        </NavigationContainer>
        </PaperProvider>
      </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}