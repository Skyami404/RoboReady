import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
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
  const { isDarkMode, liquidGlassColors, setLiquidGlassMaterial } = useTheme();
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
    <SafeAreaView style={commonStyles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView 
        style={commonStyles.container} 
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
        <View style={commonStyles.titleContainer}>
          <Text style={commonStyles.title}>RoboReady</Text>
          <Text style={[commonStyles.description, { 
            textAlign: 'center', 
            fontSize: 18,
            color: liquidGlassColors.secondaryLabel,
            marginBottom: 32
          }]}>
            Your VEX Robotics tournament companion
          </Text>
        </View>

        {/* Tournament Day Widget */}
        <TouchableOpacity
          style={[
            commonStyles.glassCard,
            commonStyles.glassElevation,
          ]}
          onPress={() => navigateToScreen('Tournament Day')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons 
              name={SFSymbols.trophyActive} 
              size={getIconSize('large')} 
              color={getIconColor(isDarkMode, 'primary')} 
              style={{ marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>Tournament Day</Text>
              <Text style={[commonStyles.description, { fontSize: 14 }]}>
                Essential checklist for tournament day
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 4 }}>{getProgressEmoji(tournamentDayProgress)}</Text>
              <Text style={[commonStyles.description, { fontSize: 13 }]}>{getProgressText(tournamentDayProgress)}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.subtitle, { fontSize: 28, color: getIconColor(isDarkMode, 'primary') }]}>
                {tournamentDayProgress}%
              </Text>
              <Text style={[commonStyles.description, { fontSize: 13 }]}>Complete</Text>
            </View>
          </View>
          
          {/* iOS 26 style progress bar */}
          <View style={{
            height: 6,
            backgroundColor: liquidGlassColors.tertiarySystemBackground,
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${tournamentDayProgress}%`,
              backgroundColor: getIconColor(isDarkMode, 'primary'),
              borderRadius: 3,
            }} />
          </View>
        </TouchableOpacity>

        {/* Week Before Widget */}
        <TouchableOpacity
          style={[
            commonStyles.glassCard,
            commonStyles.glassElevation,
          ]}
          onPress={() => navigateToScreen('Week Before')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons 
              name={SFSymbols.clipboardActive} 
              size={getIconSize('large')} 
              color={getIconColor(isDarkMode, 'accent')} 
              style={{ marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>Week Before</Text>
              <Text style={[commonStyles.description, { fontSize: 14 }]}>
                Preparation checklist for the week ahead
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 4 }}>{getProgressEmoji(weekBeforeProgress)}</Text>
              <Text style={[commonStyles.description, { fontSize: 13 }]}>{getProgressText(weekBeforeProgress)}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.subtitle, { fontSize: 28, color: getIconColor(isDarkMode, 'accent') }]}>
                {weekBeforeProgress}%
              </Text>
              <Text style={[commonStyles.description, { fontSize: 13 }]}>Complete</Text>
            </View>
          </View>
          
          {/* iOS 26 style progress bar */}
          <View style={{
            height: 6,
            backgroundColor: liquidGlassColors.tertiarySystemBackground,
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${weekBeforeProgress}%`,
              backgroundColor: getIconColor(isDarkMode, 'accent'),
              borderRadius: 3,
            }} />
          </View>
        </TouchableOpacity>

        {/* Tournaments Widget */}
        <TouchableOpacity
          style={[
            commonStyles.glassCard,
            commonStyles.glassElevation,
          ]}
          onPress={() => navigateToScreen('Tournaments')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons 
              name={SFSymbols.calendarActive} 
              size={getIconSize('large')} 
              color={getIconColor(isDarkMode, 'success')} 
              style={{ marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>Tournaments</Text>
              <Text style={[commonStyles.description, { fontSize: 14 }]}>
                Manage your tournament schedule
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.subtitle, { fontSize: 28, color: getIconColor(isDarkMode, 'success') }]}>
                {tournamentCount}
              </Text>
              <Text style={[commonStyles.description, { fontSize: 13 }]}>Total events</Text>
            </View>
            {upcomingEvent && (
              <View style={{ alignItems: 'flex-end', flex: 1, marginLeft: 16 }}>
                <Text style={[commonStyles.subtitle, { fontSize: 16, textAlign: 'right' }]} numberOfLines={1}>
                  {upcomingEvent.name.length > UPCOMING_EVENT_NAME_MAX_LENGTH ? 
                    upcomingEvent.name.substring(0, UPCOMING_EVENT_NAME_MAX_LENGTH) + '...' : 
                    upcomingEvent.name}
                </Text>
                <Text style={[commonStyles.description, { fontSize: 13, textAlign: 'right' }]}>
                  {formatEventDate(upcomingEvent.date)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <View style={{ 
          paddingVertical: 32,
          paddingHorizontal: 20,
          alignItems: 'center',
          marginBottom: Platform.OS === 'ios' ? 20 : 0,
        }}>
          <Text style={[commonStyles.description, { 
            fontSize: 14,
            textAlign: 'center',
            color: liquidGlassColors.tertiaryLabel
          }]}>
            Built for VEX Robotics teams
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 