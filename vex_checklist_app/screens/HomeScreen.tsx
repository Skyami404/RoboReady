import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../App';
import { createChecklistStyles } from '../styles/checklistStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const TOURNAMENT_DAY_KEY = 'checklist-tournament-day';
const WEEK_BEFORE_KEY = 'checklist-week-before';
const TOURNAMENTS_KEY = 'tournaments';

export default function HomeScreen() {
  const { isDarkMode } = useTheme();
  const styles = createChecklistStyles(isDarkMode);
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const [tournamentDayProgress, setTournamentDayProgress] = useState(0);
  const [weekBeforeProgress, setWeekBeforeProgress] = useState(0);
  const [tournamentCount, setTournamentCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      // Load tournament day progress
      const tournamentDayData = await AsyncStorage.getItem(TOURNAMENT_DAY_KEY);
      if (tournamentDayData) {
        const checked = JSON.parse(tournamentDayData);
        const completed = checked.filter(Boolean).length;
        const total = checked.length;
        setTournamentDayProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
      }

      // Load week before progress
      const weekBeforeData = await AsyncStorage.getItem(WEEK_BEFORE_KEY);
      if (weekBeforeData) {
        const checked = JSON.parse(weekBeforeData);
        const completed = checked.filter(Boolean).length;
        const total = checked.length;
        setWeekBeforeProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
      }

      // Load tournament count
      const tournamentsData = await AsyncStorage.getItem(TOURNAMENTS_KEY);
      if (tournamentsData) {
        const tournaments = JSON.parse(tournamentsData);
        setTournamentCount(tournaments.length || 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const homeStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 8,
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    subtitle: {
      fontSize: 16,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
      lineHeight: 22,
    },
    widgetContainer: {
      marginBottom: 20,
    },
    widget: {
      borderRadius: 16,
      padding: 24,
      shadowColor: isDarkMode ? '#000000' : '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    widgetLight: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    widgetDark: {
      backgroundColor: '#1F2937',
      borderWidth: 1,
      borderColor: '#374151',
    },
    widgetTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    widgetDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
    },
    widgetIcon: {
      fontSize: 24,
      marginBottom: 12,
    },
    widgetStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#60A5FA' : '#1D4ED8',
    },
    statLabel: {
      fontSize: 12,
      color: isDarkMode ? '#9CA3AF' : '#6B7280',
      marginTop: 2,
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: isDarkMode ? '#60A5FA' : '#1D4ED8',
    },
    footer: {
      marginTop: 20,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: isDarkMode ? '#6B7280' : '#9CA3AF',
      textAlign: 'center',
    },
  });

  const navigateToScreen = (screenName: string) => {
    navigation.navigate(screenName as never);
  };

  const getProgressEmoji = (progress: number) => {
    if (progress === 100) return '🎉';
    if (progress >= 75) return '🔥';
    if (progress >= 50) return '⚡';
    if (progress >= 25) return '🚀';
    return '📝';
  };

  const getProgressText = (progress: number) => {
    if (progress === 100) return 'Complete!';
    if (progress >= 75) return 'Almost there!';
    if (progress >= 50) return 'Halfway!';
    if (progress >= 25) return 'Getting started';
    return 'Ready to start';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={homeStyles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={homeStyles.header}>
          <Text style={homeStyles.title}>RoboReady</Text>
          <Text style={homeStyles.subtitle}>
            Your complete VEX Robotics tournament companion
          </Text>
        </View>

        {/* Tournament Day Widget */}
        <View style={homeStyles.widgetContainer}>
          <TouchableOpacity
            style={[
              homeStyles.widget,
              isDarkMode ? homeStyles.widgetDark : homeStyles.widgetLight,
            ]}
            onPress={() => navigateToScreen('Tournament Day')}
            activeOpacity={0.8}
          >
            <Text style={homeStyles.widgetIcon}>🏆</Text>
            <Text style={homeStyles.widgetTitle}>Tournament Day</Text>
            <Text style={homeStyles.widgetDescription}>
              Essential checklist for tournament day. Make sure your robot is ready to compete.
            </Text>
            <View style={homeStyles.widgetStats}>
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statNumber}>{getProgressEmoji(tournamentDayProgress)}</Text>
                <Text style={homeStyles.statLabel}>{getProgressText(tournamentDayProgress)}</Text>
              </View>
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statNumber}>{tournamentDayProgress}%</Text>
                <Text style={homeStyles.statLabel}>Complete</Text>
              </View>
            </View>
            <View style={homeStyles.progressBar}>
              <View style={[homeStyles.progressFill, { width: `${tournamentDayProgress}%` }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Week Before Widget */}
        <View style={homeStyles.widgetContainer}>
          <TouchableOpacity
            style={[
              homeStyles.widget,
              isDarkMode ? homeStyles.widgetDark : homeStyles.widgetLight,
            ]}
            onPress={() => navigateToScreen('Week Before')}
            activeOpacity={0.8}
          >
            <Text style={homeStyles.widgetIcon}>📋</Text>
            <Text style={homeStyles.widgetTitle}>Week Before</Text>
            <Text style={homeStyles.widgetDescription}>
              Preparation checklist for the week leading up to your tournament.
            </Text>
            <View style={homeStyles.widgetStats}>
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statNumber}>{getProgressEmoji(weekBeforeProgress)}</Text>
                <Text style={homeStyles.statLabel}>{getProgressText(weekBeforeProgress)}</Text>
              </View>
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statNumber}>{weekBeforeProgress}%</Text>
                <Text style={homeStyles.statLabel}>Complete</Text>
              </View>
            </View>
            <View style={homeStyles.progressBar}>
              <View style={[homeStyles.progressFill, { width: `${weekBeforeProgress}%` }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tournaments Widget */}
        <View style={homeStyles.widgetContainer}>
          <TouchableOpacity
            style={[
              homeStyles.widget,
              isDarkMode ? homeStyles.widgetDark : homeStyles.widgetLight,
            ]}
            onPress={() => navigateToScreen('Tournaments')}
            activeOpacity={0.8}
          >
            <Text style={homeStyles.widgetIcon}>📅</Text>
            <Text style={homeStyles.widgetTitle}>Tournaments</Text>
            <Text style={homeStyles.widgetDescription}>
              Manage your tournament schedule, set reminders, and track events.
            </Text>
            <View style={homeStyles.widgetStats}>
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statNumber}>{tournamentCount}</Text>
                <Text style={homeStyles.statLabel}>Events</Text>
              </View>
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statNumber}>🔔</Text>
                <Text style={homeStyles.statLabel}>Alerts</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={homeStyles.footer}>
          <Text style={homeStyles.footerText}>
            Built for VEX Robotics teams
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 