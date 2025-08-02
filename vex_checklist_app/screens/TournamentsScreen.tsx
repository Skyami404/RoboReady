import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput, Card, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarService, Tournament } from '../utils/calendarService';
import { TournamentStorage } from '../utils/tournamentStorage';
import { SFSymbols, getIconColor, getIconSize } from '../utils/sfSymbols';
import { useTheme } from '../App';
import { createChecklistStyles } from '../styles/checklistStyles';
import { createTournamentStyles } from '../styles/tournamentStyles';

export default function TournamentsScreen() {
  const { isDarkMode } = useTheme();
  const styles = createChecklistStyles(isDarkMode);
  const formStyles = createTournamentStyles(isDarkMode);
  
  const [tournamentName, setTournamentName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    const loadedTournaments = await TournamentStorage.getTournaments();
    setTournaments(loadedTournaments);
  };

  const handleAddTournament = async () => {
    if (!tournamentName.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    setIsLoading(true);
    
    try {
      const newTournament: Tournament = {
        id: Date.now().toString(),
        name: tournamentName.trim(),
        location: location.trim() || undefined,
        date: selectedDate
      };

      // Save to local storage
      const saved = await TournamentStorage.saveTournament(newTournament);
      if (!saved) {
        Alert.alert('Error', 'Failed to save tournament');
        return;
      }

      // Add to calendar
      const calendarEventId = await CalendarService.createTournamentEvent(newTournament);
      if (calendarEventId) {
        newTournament.calendarEventId = calendarEventId;
        await TournamentStorage.updateTournament(newTournament);
      }

      // Reload tournaments
      await loadTournaments();
      
      // Clear form
      setTournamentName('');
      setLocation('');
      setSelectedDate(new Date());
      
      Alert.alert('Success', 'Tournament added successfully!');
    } catch (error) {
      console.error('Error adding tournament:', error);
      Alert.alert('Error', 'Failed to add tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTournament = async (tournament: Tournament) => {
    Alert.alert(
      'Delete Tournament',
      `Are you sure you want to delete "${tournament.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from calendar if it exists
              if (tournament.calendarEventId) {
                await CalendarService.deleteTournamentEvent(tournament.calendarEventId);
              }
              
              // Delete from local storage
              await TournamentStorage.deleteTournament(tournament.id);
              
              // Reload tournaments
              await loadTournaments();
              
              Alert.alert('Success', 'Tournament deleted successfully!');
            } catch (error) {
              console.error('Error deleting tournament:', error);
              Alert.alert('Error', 'Failed to delete tournament');
            }
          }
        }
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={formStyles.titleContainer}>
          <Text style={styles.title}>Tournament List</Text>
        </View>
        
        {/* Calendar Permission Message */}
        <View style={formStyles.permissionContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons 
              name={SFSymbols.calendar} 
              size={getIconSize('small')} 
              color={getIconColor(isDarkMode, 'primary')} 
              style={{ marginRight: 8 }}
            />
            <Text style={formStyles.permissionText}>
              Enable calendar access for notifications and to view tournaments in your personal calendar
            </Text>
          </View>
          <Button
            mode="text"
            onPress={() => Linking.openSettings()}
            style={formStyles.settingsButton}
            textColor={isDarkMode ? '#93c5fd' : '#1976d2'}
          >
            Open Settings
          </Button>
        </View>
        
        <View style={formStyles.formContainer}>
          <TextInput
            label="Tournament Name"
            value={tournamentName}
            onChangeText={setTournamentName}
            style={formStyles.input}
            mode="outlined"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
          />
          
          <TextInput
            label="Location (optional)"
            value={location}
            onChangeText={setLocation}
            style={formStyles.input}
            mode="outlined"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
            placeholder="Enter tournament location or leave blank"
          />
          
          <Button
            mode="outlined"
            icon={() => (
              <Ionicons 
                name={SFSymbols.calendar} 
                size={getIconSize('small')} 
                color={getIconColor(isDarkMode, 'primary')} 
              />
            )}
            onPress={() => setShowDatePicker(true)}
            style={formStyles.input}
          >
            {`Date: ${formatDate(selectedDate)} at ${formatTime(selectedDate)}`}
          </Button>
          

          
          <Button
            mode="contained"
            onPress={handleAddTournament}
            style={formStyles.addButton}
            icon={() => (
              <Ionicons 
                name={SFSymbols.plus} 
                size={getIconSize('small')} 
                color={getIconColor(isDarkMode, 'primary')} 
              />
            )}
            loading={isLoading}
            disabled={isLoading}
          >
            Add Tournament
          </Button>
        </View>

        {/* Tournament List */}
        <View style={formStyles.tournamentList}>
          <Text style={formStyles.sectionTitle}>Your Tournaments</Text>
          {tournaments.length === 0 ? (
            <Card 
              style={formStyles.tournamentCard}
              mode={isDarkMode ? 'outlined' : 'elevated'}
            >
              <Card.Content>
                <Text style={formStyles.subtitle}>No tournaments yet</Text>
                <Text style={formStyles.description}>
                  Add your first tournament using the form above!
                </Text>
              </Card.Content>
            </Card>
          ) : (
            tournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                style={formStyles.tournamentCard}
                mode={isDarkMode ? 'outlined' : 'elevated'}
              >
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={formStyles.subtitle}>{tournament.name}</Text>
                      {tournament.location && (
                        <Text style={formStyles.description}>📍 {tournament.location}</Text>
                      )}
                      <Text style={formStyles.description}>
                        📅 {formatDate(tournament.date)} at {formatTime(tournament.date)}
                      </Text>
                      {tournament.calendarEventId && (
                        <Text style={[formStyles.description, { color: '#4caf50' }]}>
                          ✅ Added to calendar
                        </Text>
                      )}
                    </View>
                    <IconButton
                      icon={() => (
                        <Ionicons 
                          name={SFSymbols.delete} 
                          size={getIconSize('small')} 
                          color={getIconColor(isDarkMode, 'error')} 
                        />
                      )}
                      size={20}
                      onPress={() => handleDeleteTournament(tournament)}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
      
      {showDatePicker && (
        <View style={formStyles.datePickerOverlay}>
                        <TouchableOpacity
                style={formStyles.overlayBackground}
                activeOpacity={1}
                onPress={() => {
                  setShowDatePicker(false);
                }}
              />
          <View style={formStyles.datePickerContainer}>
            <DateTimePicker
              value={selectedDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}


