import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, IconButton } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SFSymbols, getIconColor } from './utils/sfSymbols';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import TournamentDayScreen from './screens/TournamentDayScreen';
import WeekBeforeScreen from './screens/WeekBeforeScreen';
import TournamentsScreen from './screens/TournamentsScreen';


const Tab = createBottomTabNavigator();

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1D4ED8',
    outline: '#374151',
    onSurface: '#000000',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f8fafc',
    onSurfaceVariant: '#374151',
    card: '#ffffff',
    text: '#000000',
    border: '#e5e7eb',
    notification: '#EF4444',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    outline: '#9CA3AF',
    onSurface: '#ffffff',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    onSurfaceVariant: '#D1D5DB',
    card: '#1E1E1E',
    text: '#ffffff',
    border: '#374151',
    notification: '#F87171',
  },
};

function AppContent() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const paperTheme = isDarkMode ? darkTheme : lightTheme;
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.notification,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '900' as const },
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
              <PaperProvider theme={paperTheme}>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} translucent={true} />
            <Tab.Navigator
                id={undefined}
                screenOptions={({ route }) => ({
                  headerShown: true,
                  headerTitle: '',
                  headerStyle: {
                    backgroundColor: paperTheme.colors.surface,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0,
                  },
                  headerSafeAreaInsets: { top: 0 },
                  headerTintColor: paperTheme.colors.onSurface,
                  headerTitleStyle: {
                    fontWeight: '600',
                  },
                  headerRight: () => (
                    <IconButton
                      icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
                      iconColor={paperTheme.colors.onSurface}
                      size={24}
                      onPress={toggleDarkMode}
                    />
                  ),
                  tabBarActiveTintColor: paperTheme.colors.primary,
                  tabBarInactiveTintColor: paperTheme.colors.outline,
                                  tabBarStyle: {
                    backgroundColor: paperTheme.colors.surface,
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 80,
                    paddingBottom: 18,
                    paddingTop: 8,
                  },
                                       tabBarIcon: ({ focused, color, size }) => {
                         let iconName: keyof typeof Ionicons.glyphMap = 'home';
                         if (route.name === 'Home') {
                           iconName = SFSymbols.home;
                         } else if (route.name === 'Tournament Day') {
                           iconName = SFSymbols.trophy;
                         } else if (route.name === 'Week Before') {
                           iconName = SFSymbols.clipboard;
                         } else if (route.name === 'Tournaments') {
                           iconName = SFSymbols.calendar;
                         }
                         return <Ionicons name={iconName} size={size} color={color} />;
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