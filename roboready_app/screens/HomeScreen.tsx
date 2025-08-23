import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createChecklistStyles } from '../styles/checklistStyles';
import { createHomeStyles } from '../styles/homeStyles';
import { createCommonStyles } from '../styles/commonStyles';
import { SFSymbols, getIconColor, getIconSize } from '../utils/sfSymbols';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TournamentStorage } from '../utils/tournamentStorage';

const TOURNAMENT_DAY_KEY = 'checklist-tournament-day';
const WEEK_BEFORE_KEY = 'checklist-week-before';
const TOURNAMENTS_KEY = 'tournaments';
const UPCOMING_EVENT_NAME_MAX_LENGTH = 15;

export default function HomeScreen() {
  const { isDarkMode } = useTheme();
  const styles = createChecklistStyles(isDarkMode);
  const homeStyles = createHomeStyles(isDarkMode);
  const commonStyles = createCommonStyles(isDarkMode);
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const [tournamentDayProgress, setTournamentDayProgress] = useState(0);
  const [weekBeforeProgress, setWeekBeforeProgress] = useState(0);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [upcomingEvent, setUpcomingEvent] = useState<{ name: string; date: Date } | null>(null);

  // Update header title based on scroll state
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
    });
  }, [navigation]);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Force refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Add a small delay to ensure data is saved
      setTimeout(() => {
        loadData();
      }, 100);
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

      // Load tournament count and upcoming event using the service
      const count = await TournamentStorage.getTournamentCount();
      setTournamentCount(count);
      
      // Get next upcoming tournament (earliest future date)
      const tournaments = await TournamentStorage.getTournaments();
      
      const now = new Date();
      
      // More robust date comparison - compare only the date part (ignore time)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const futureTournaments = tournaments.filter(t => {
        const dateObj = new Date(t.date);
        const tournamentDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        return tournamentDate >= today;
      });
      
      const upcoming = futureTournaments
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      
      if (upcoming) {
        setUpcomingEvent({
          name: upcoming.name,
          date: new Date(upcoming.date)
        });
      } else {
        setUpcomingEvent(null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };



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

  const formatEventDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView 
        style={homeStyles.container} 
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        onScrollBeginDrag={() => navigation.setOptions({ headerTitle: 'RoboReady' })}
        onMomentumScrollEnd={(event) => {
          if (event.nativeEvent.contentOffset.y === 0) {
            navigation.setOptions({ headerTitle: '' });
          }
        }}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={[homeStyles.header, commonStyles.titleContainer]}>
          <Text style={homeStyles.title}>RoboReady</Text>
          <Text style={homeStyles.subtitle}>
            Your VEX Robotics tournament companion
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons 
                name={SFSymbols.trophy} 
                size={getIconSize('medium')} 
                color={getIconColor(isDarkMode, 'primary')} 
                style={{ marginRight: 12 }}
              />
              <Text style={homeStyles.widgetTitle}>Tournament Day</Text>
            </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons 
                name={SFSymbols.clipboard} 
                size={getIconSize('medium')} 
                color={getIconColor(isDarkMode, 'primary')} 
                style={{ marginRight: 12 }}
              />
              <Text style={homeStyles.widgetTitle}>Week Before</Text>
            </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons 
                name={SFSymbols.calendar} 
                size={getIconSize('medium')} 
                color={getIconColor(isDarkMode, 'primary')} 
                style={{ marginRight: 12 }}
              />
              <Text style={homeStyles.widgetTitle}>Tournaments</Text>
            </View>
            <Text style={homeStyles.widgetDescription}>
              Manage your tournament schedule.
            </Text>
            <View style={homeStyles.widgetStats}>
              <View style={homeStyles.statItem}>
                <Text style={homeStyles.statNumber}>{tournamentCount}</Text>
                <Text style={homeStyles.statLabel}>Total events</Text>
              </View>
              {upcomingEvent && (
                <View style={homeStyles.statItem}>
                  <Text style={[homeStyles.statNumber, homeStyles.statNumberSmall]} numberOfLines={1}>
                    {upcomingEvent.name.length > UPCOMING_EVENT_NAME_MAX_LENGTH ? upcomingEvent.name.substring(0, UPCOMING_EVENT_NAME_MAX_LENGTH) + '...' : upcomingEvent.name}
                  </Text>
                  <Text style={homeStyles.statLabel}>Upcoming: {formatEventDate(upcomingEvent.date)}</Text>
                </View>
              )}
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