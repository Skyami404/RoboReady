import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Card, 
  Button, 
  TextInput, 
  IconButton, 
  Portal, 
  Modal,
  useTheme as usePaperTheme,
  List,
  RadioButton
} from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../App';
import { createChecklistStyles } from '../styles/checklistStyles';

interface Tournament {
  id: string;
  name: string;
  date: Date;
  location: string;
  reminders: number[]; // hours before tournament
  calendarEventId?: string;
}

const REMINDER_PRESETS = [
  { label: 'At time of event', value: 0 },
  { label: '5 minutes before', value: 5 / 60 },
  { label: '15 minutes before', value: 15 / 60 },
  { label: '30 minutes before', value: 30 / 60 },
  { label: '1 hour before', value: 1 },
  { label: '2 hours before', value: 2 },
  { label: '1 day before', value: 24 },
  { label: '2 days before', value: 48 },
  { label: '1 week before', value: 168 },
  { label: 'Custom...', value: 'custom' },
];

export default function ResourcesScreen() {
  const { isDarkMode } = useTheme();
  const paperTheme = usePaperTheme();
  const styles = createChecklistStyles(isDarkMode);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date(),
    location: '',
    reminders: [24, 1], // Default: 1 day and 1 hour before
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<number | 'custom'>(24);
  const [customReminderValue, setCustomReminderValue] = useState('');
  const [customReminderUnit, setCustomReminderUnit] = useState<'minutes' | 'hours' | 'days'>('hours');

  // Add state for date picker
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState(new Date());

  // Add state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    requestPermissions();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    // Configure notification behavior
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  };

  const requestPermissions = async () => {
    const notificationStatus = await Notifications.requestPermissionsAsync();
    const calendarStatus = await Calendar.requestCalendarPermissionsAsync();
    
    if (notificationStatus.status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications to receive tournament reminders!');
    }
    
    if (calendarStatus.status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable calendar access to add tournament events!');
    }
  };

  const addTournament = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    const newTournament: Tournament = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      date: formData.date,
      location: formData.location.trim() || 'TBD', // Make location optional
      reminders: formData.reminders,
    };

    try {
      // Add to calendar
      const calendarEventId = await addToCalendar(newTournament);
      newTournament.calendarEventId = calendarEventId;
      
      // Schedule notifications
      await scheduleNotifications(newTournament);
      
      setTournaments(prev => [...prev, newTournament]);
      resetForm();
      setModalVisible(false);
      setIsEditing(false);
      setEditingId(null);
      Alert.alert('Success', 'Tournament added to calendar with reminders!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add tournament. Please check your permissions.');
    }
  };

  const addToCalendar = async (tournament: Tournament): Promise<string> => {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
    
    if (!defaultCalendar) {
      throw new Error('No calendar available');
    }

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title: `VEX Tournament: ${tournament.name}`,
      startDate: tournament.date,
      endDate: new Date(tournament.date.getTime() + 8 * 60 * 60 * 1000), // 8 hours
      location: tournament.location,
      notes: `VEX Tournament Checklist:\n- Robot and controller\n- Engineering notebook\n- Spare parts and tools\n- Team information\n- Batteries and chargers`,
      alarms: tournament.reminders.map(hours => ({ relativeOffset: -hours * 60 })),
    });

    return eventId;
  };

  const scheduleNotifications = async (tournament: Tournament) => {
    for (const hours of tournament.reminders) {
      const triggerDate = new Date(tournament.date.getTime() - hours * 60 * 60 * 1000);
      
      if (triggerDate > new Date()) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Tournament Reminder: ${tournament.name}`,
              body: `Tournament starts in ${hours === 0 ? 'now' : hours >= 24 ? hours / 24 + ' day' + (hours / 24 > 1 ? 's' : '') : hours < 1 ? Math.round(hours * 60) + ' min' : hours + ' hour' + (hours > 1 ? 's' : '')}!
Location: ${tournament.location}`,
              data: { tournamentId: tournament.id },
              sound: 'default',
              priority: 'high',
            },
            trigger: { date: triggerDate },
          } as any);
          console.log(`Scheduled notification for ${tournament.name} at ${triggerDate.toLocaleString()}`);
        } catch (error) {
          console.error('Failed to schedule notification:', error);
        }
      } else {
        console.log(`Skipping notification for ${tournament.name} - trigger date ${triggerDate.toLocaleString()} is in the past`);
      }
    }
  };

  const deleteTournament = async (tournament: Tournament) => {
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
              // Remove from calendar
              if (tournament.calendarEventId) {
                await Calendar.deleteEventAsync(tournament.calendarEventId);
              }
              
              // Cancel notifications
              await Notifications.cancelAllScheduledNotificationsAsync();
              
              // Remove from state
              setTournaments(prev => prev.filter(t => t.id !== tournament.id));
              
              // Reschedule remaining notifications
              for (const t of tournaments.filter(t => t.id !== tournament.id)) {
                await scheduleNotifications(t);
              }
              
              Alert.alert('Success', 'Tournament deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete tournament');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: new Date(),
      location: '',
      reminders: [24, 1],
    });
    setEditingTournament(null);
    setSelectedReminder(24);
    setCustomReminderValue('');
    setCustomReminderUnit('hours');
  };

  // When opening the custom reminder modal, default to days
  const openCustomReminderModal = () => {
    setCustomReminderUnit('days');
    setCustomReminderValue('');
    setReminderModalVisible(true);
  };

  // Update handleReminderSelect to use the new openCustomReminderModal
  const handleReminderSelect = (value: number | 'custom') => {
    if (value === 'custom') {
      openCustomReminderModal();
    } else {
      setSelectedReminder(value);
      setFormData(prev => ({ ...prev, reminders: [value] }));
    }
  };

  const handleAddCustomReminder = () => {
    const value = parseInt(customReminderValue, 10);
    if (isNaN(value) || value < 0) return;
    let hours = 0;
    if (customReminderUnit === 'minutes') hours = value / 60;
    if (customReminderUnit === 'hours') hours = value;
    if (customReminderUnit === 'days') hours = value * 24;
    setSelectedReminder(hours);
    setFormData(prev => ({ ...prev, reminders: [hours] }));
    setReminderModalVisible(false);
    setCustomReminderValue('');
    setCustomReminderUnit('hours');
  };

  const testNotification = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications to test them!');
        return;
      }

      // Schedule a test notification for 5 seconds from now
      const triggerDate = new Date(Date.now() + 5000);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification 🧪',
          body: 'This is a test notification to verify everything is working!',
          data: { type: 'test' },
          sound: 'default',
          priority: 'high',
        },
        trigger: { date: triggerDate },
      } as any);

      Alert.alert('Test Scheduled', 'A test notification will appear in 5 seconds. Make sure your device is not in silent mode.');
    } catch (error) {
      console.error('Test notification error:', error);
      Alert.alert('Error', 'Failed to schedule test notification. Check console for details.');
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

  // Responsive width for modal
  const { width } = Dimensions.get('window');
  const modalWidth = Math.min(width - 32, 400);

  const mergedStyles = { ...styles, ...extraStyles };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      if (datePickerMode === 'date') {
        // Keep the current time, update the date
        const newDate = new Date(selectedDate);
        newDate.setHours(tempDate.getHours(), tempDate.getMinutes());
        setTempDate(newDate);
        setDatePickerMode('time');
        if (Platform.OS === 'ios') {
          // On iOS, show time picker next
          setShowDatePicker(true);
        }
      } else {
        // Update the time
        const newDate = new Date(tempDate);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setTempDate(newDate);
        setFormData(prev => ({ ...prev, date: newDate }));
        setShowDatePicker(false);
        setDatePickerMode('date');
      }
    }
  };

  const openDatePicker = () => {
    setTempDate(formData.date);
    setDatePickerMode('date');
    setShowDatePicker(true);
  };

  // Open modal for editing
  const openEditModal = (tournament: Tournament) => {
    setFormData({
      name: tournament.name,
      date: tournament.date,
      location: tournament.location === 'TBD' ? '' : tournament.location,
      reminders: tournament.reminders,
    });
    setIsEditing(true);
    setEditingId(tournament.id);
    setModalVisible(true);
  };

  // Save changes to tournament
  const saveTournament = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }
    const updatedTournament: Tournament = {
      id: editingId!,
      name: formData.name.trim(),
      date: formData.date,
      location: formData.location.trim() || 'TBD',
      reminders: formData.reminders,
      calendarEventId: tournaments.find(t => t.id === editingId)?.calendarEventId,
    };
    try {
      // Update calendar event
      if (updatedTournament.calendarEventId) {
        await Calendar.updateEventAsync(updatedTournament.calendarEventId, {
          title: `VEX Tournament: ${updatedTournament.name}`,
          startDate: updatedTournament.date,
          endDate: new Date(updatedTournament.date.getTime() + 8 * 60 * 60 * 1000),
          location: updatedTournament.location,
          notes: `VEX Tournament Checklist:\n- Robot and controller\n- Engineering notebook\n- Spare parts and tools\n- Team information\n- Batteries and chargers`,
          alarms: updatedTournament.reminders.map(hours => ({ relativeOffset: -hours * 60 })),
        });
      }
      // Update notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      await scheduleNotifications(updatedTournament);
      // Update state
      setTournaments(prev => prev.map(t => t.id === editingId ? updatedTournament : t));
      resetForm();
      setModalVisible(false);
      setIsEditing(false);
      setEditingId(null);
      Alert.alert('Success', 'Tournament updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update tournament. Please check your permissions.');
    }
  };

  return (
    <SafeAreaView style={mergedStyles.safeArea}>
      <ScrollView style={mergedStyles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={mergedStyles.title}>Tournament Manager</Text>
        
        <Card style={[mergedStyles.card, { backgroundColor: paperTheme.colors.surfaceVariant }]}> 
          <Card.Content>
            <Text style={[mergedStyles.cardTitle, { color: paperTheme.colors.onSurfaceVariant }]}> 
              Upcoming Tournaments ({tournaments.length})
            </Text>
            {tournaments.length === 0 ? (
              <Text style={[mergedStyles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}> 
                No tournaments scheduled. Add your first tournament below!
              </Text>
            ) : (
              tournaments.map((tournament) => (
                <Card key={tournament.id} style={[mergedStyles.tournamentCard, { backgroundColor: paperTheme.colors.surface }]}> 
                  <Card.Content>
                    <View style={mergedStyles.tournamentHeader}>
                      <View style={mergedStyles.tournamentInfo}>
                        <Text style={[mergedStyles.tournamentName, { color: paperTheme.colors.onSurface }]}> 
                          {tournament.name}
                        </Text>
                        <Text style={[mergedStyles.tournamentDate, { color: paperTheme.colors.onSurfaceVariant }]}> 
                          {formatDate(tournament.date)} at {formatTime(tournament.date)}
                        </Text>
                        <Text style={[mergedStyles.tournamentLocation, { color: paperTheme.colors.onSurfaceVariant }]}> 
                          📍 {tournament.location}
                        </Text>
                      </View>
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => deleteTournament(tournament)}
                        iconColor={paperTheme.colors.error}
                      />
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => openEditModal(tournament)}
                        iconColor={paperTheme.colors.primary}
                        style={{ marginLeft: 0, marginRight: 0 }}
                      />
                    </View>
                    <View style={mergedStyles.remindersContainer}>
                      <Text style={[mergedStyles.remindersLabel, { color: paperTheme.colors.onSurfaceVariant }]}> 
                        Reminders:
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {tournament.reminders.map((hours) => (
                          <View key={hours} style={{ marginRight: 8, marginBottom: 8, backgroundColor: paperTheme.colors.surfaceVariant, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 }}>
                            <Text style={{ color: paperTheme.colors.onSurfaceVariant, fontSize: 13 }}>
                              {hours === 0 ? 'At time of event' : hours >= 24 ? `${hours / 24} day${hours / 24 > 1 ? 's' : ''} before` : hours < 1 ? `${Math.round(hours * 60)} min before` : `${hours} hour${hours > 1 ? 's' : ''} before`}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => setModalVisible(true)}
          style={mergedStyles.addButton}
          icon="plus"
        >
          Add Tournament
        </Button>

        <Button
          mode="outlined"
          onPress={testNotification}
          style={[mergedStyles.addButton, { marginTop: 10 }]}
          icon="bell"
        >
          Test Notifications
        </Button>

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => {
              setModalVisible(false);
              resetForm();
            }}
            contentContainerStyle={[mergedStyles.modal, { backgroundColor: paperTheme.colors.surface, width: modalWidth, alignSelf: 'center' }]}
          >
            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={[mergedStyles.modalTitle, { color: paperTheme.colors.onSurface }]}> 
                Add Tournament
              </Text>
              
              <TextInput
                label="Tournament Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                style={mergedStyles.input}
                mode="outlined"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
              />
              
              <TextInput
                label="Location (optional)"
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                style={mergedStyles.input}
                mode="outlined"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
                placeholder="Enter tournament location or leave blank"
              />
              
              <Button
                mode="outlined"
                icon="calendar"
                onPress={openDatePicker}
                style={{ marginBottom: 10 }}
              >
                {`Set Date: ${formatDate(formData.date)} at ${formatTime(formData.date)}`}
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode={datePickerMode}
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleDateChange}
                  // On iOS, textColor works. On Android, this is ignored by the native picker.
                  {...(Platform.OS === 'ios' ? { textColor: isDarkMode ? '#000' : '#fff' } : {})}
                />
              )}
              
              <Text style={[mergedStyles.sectionTitle, { color: paperTheme.colors.onSurface, marginTop: 16 }]}> 
                Reminder
              </Text>
              <List.Section style={{ padding: 0, margin: 0 }}>
                {REMINDER_PRESETS.map((option) => (
                  <List.Item
                    key={option.label}
                    title={option.label}
                    titleStyle={{ fontSize: 15, flexWrap: 'wrap', color: paperTheme.colors.onSurface }}
                    style={{ paddingVertical: 0, minHeight: 36 }}
                    onPress={() => handleReminderSelect(option.value as number | 'custom')}
                    right={() => (
                      <RadioButton
                        value={option.value.toString()}
                        status={selectedReminder === (option.value as number | 'custom') ? 'checked' : 'unchecked'}
                        onPress={() => handleReminderSelect(option.value as number | 'custom')}
                      />
                    )}
                  />
                ))}
              </List.Section>

              {/* Custom Reminder Modal */}
              <Portal>
                <Modal
                  visible={reminderModalVisible}
                  onDismiss={() => setReminderModalVisible(false)}
                  contentContainerStyle={{ backgroundColor: paperTheme.colors.surface, padding: 20, borderRadius: 8, width: modalWidth, alignSelf: 'center' }}
                >
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10, color: paperTheme.colors.onSurface }}>
                    Custom Reminder
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TextInput
                      label={customReminderUnit === 'days' ? 'Number of days before' : customReminderUnit === 'hours' ? 'Number of hours before' : 'Number of minutes before'}
                      value={customReminderValue}
                      onChangeText={setCustomReminderValue}
                      style={{ flex: 1, marginRight: 8 }}
                      mode="outlined"
                      keyboardType="numeric"
                      placeholder={customReminderUnit === 'days' ? 'e.g. 2' : customReminderUnit === 'hours' ? 'e.g. 6' : 'e.g. 30'}
                      maxLength={4}
                    />
                    <Button
                      mode={customReminderUnit === 'minutes' ? 'contained' : 'outlined'}
                      onPress={() => setCustomReminderUnit('minutes')}
                      style={{ marginRight: 4 }}
                    >
                      min
                    </Button>
                    <Button
                      mode={customReminderUnit === 'hours' ? 'contained' : 'outlined'}
                      onPress={() => setCustomReminderUnit('hours')}
                      style={{ marginRight: 4 }}
                    >
                      hr
                    </Button>
                    <Button
                      mode={customReminderUnit === 'days' ? 'contained' : 'outlined'}
                      onPress={() => setCustomReminderUnit('days')}
                    >
                      day
                    </Button>
                  </View>
                  {/* Quick pick for common day values */}
                  {customReminderUnit === 'days' && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                      {[1, 2, 3, 5, 7].map((d) => (
                        <Button
                          key={d}
                          mode={customReminderValue === d.toString() ? 'contained' : 'outlined'}
                          onPress={() => setCustomReminderValue(d.toString())}
                          style={{ marginRight: 8, marginBottom: 8 }}
                        >
                          {d} day{d > 1 ? 's' : ''}
                        </Button>
                      ))}
                    </View>
                  )}
                  <Button mode="contained" onPress={handleAddCustomReminder}>
                    Set Reminder
                  </Button>
                </Modal>
              </Portal>

              <View style={mergedStyles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  style={mergedStyles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={isEditing ? saveTournament : addTournament}
                  style={mergedStyles.modalButton}
                >
                  {isEditing ? 'Save Changes' : 'Add Tournament'}
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 46,
    textAlign: 'center'
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  tournamentCard: {
    marginBottom: 10,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tournamentDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  tournamentLocation: {
    fontSize: 14,
  },
  remindersContainer: {
    marginTop: 10,
  },
  remindersLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  reminderChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addButton: {
    marginTop: 10,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

const extraStyles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
    flexWrap: 'wrap',
  },
  tournamentCard: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  tournamentInfo: {
    flex: 1,
    minWidth: 0,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  tournamentDate: {
    fontSize: 14,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  tournamentLocation: {
    fontSize: 14,
    flexWrap: 'wrap',
  },
  remindersContainer: {
    marginTop: 10,
    flexWrap: 'wrap',
  },
  remindersLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  addButton: {
    marginTop: 10,
    borderRadius: 8,
    minWidth: 160,
    alignSelf: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
    minWidth: 260,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  input: {
    marginBottom: 15,
    minWidth: 0,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    minWidth: 100,
  },
});

// Merge extraStyles into styles for use in the component
Object.assign(styles, extraStyles);