import * as Calendar from 'expo-calendar';
import { Alert, Linking } from 'react-native';

// Constants
const TOURNAMENT_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

export interface Tournament {
  id: string;
  name: string;
  location?: string;
  date: Date;
  calendarEventId?: string;
}

export class CalendarService {
  static async requestCalendarPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  }

  static async checkCalendarPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      const errorMessage = error && error.message ? error.message : String(error);
      console.error(`Error checking calendar permissions [${error && error.name ? error.name : typeof error}]: ${errorMessage}`, error);
      Alert.alert(
        'Calendar Permission Error',
        'Unable to check calendar permissions. Please ensure the app has the necessary permissions in your device settings.'
      );
      return false;
    }
  }

  static async createTournamentEvent(tournament: Tournament): Promise<string | null> {
    try {
      const hasPermission = await this.checkCalendarPermissions();
      if (!hasPermission) {
        const granted = await this.requestCalendarPermissions();
        if (!granted) {
          // Don't show popup - user can use the calendar access message at the top of the screen
          return null;
        }
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar found on device');
        return null;
      }

      const eventDetails = {
        title: `VEX Tournament: ${tournament.name}`,
        startDate: tournament.date,
        endDate: new Date(tournament.date.getTime() + TOURNAMENT_DURATION_MS), // 8 hours duration
        location: tournament.location || 'Tournament Location',
        notes: `VEX Robotics Tournament\n${tournament.location ? `Location: ${tournament.location}\n` : ''}Added via RoboReady app`,
        alarms: [
          { relativeOffset: -60 }, // 1 hour before
          { relativeOffset: -1440 } // 1 day before
        ]
      };

      const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      return eventId;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      Alert.alert('Error', 'Failed to add tournament to calendar. Please try again.');
      return null;
    }
  }

  static async deleteTournamentEvent(eventId: string): Promise<boolean> {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }
} 