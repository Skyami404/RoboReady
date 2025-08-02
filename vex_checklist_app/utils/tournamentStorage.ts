import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tournament } from './calendarService';

const TOURNAMENTS_KEY = 'tournaments';

export class TournamentStorage {
  static async saveTournament(tournament: Tournament): Promise<boolean> {
    try {
      const existingTournaments = await this.getTournaments();
      const updatedTournaments = [...existingTournaments, tournament];
      await AsyncStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(updatedTournaments));
      return true;
    } catch (error) {
      console.error('Error saving tournament:', error);
      return false;
    }
  }

  static async getTournaments(): Promise<Tournament[]> {
    try {
      const tournamentsData = await AsyncStorage.getItem(TOURNAMENTS_KEY);
      if (tournamentsData) {
        const tournaments = JSON.parse(tournamentsData);
        // Convert date strings back to Date objects
        return tournaments.map((tournament: any) => ({
          ...tournament,
          date: new Date(tournament.date)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading tournaments:', error);
      return [];
    }
  }

  static async deleteTournament(tournamentId: string): Promise<boolean> {
    try {
      const existingTournaments = await this.getTournaments();
      const updatedTournaments = existingTournaments.filter(t => t.id !== tournamentId);
      await AsyncStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(updatedTournaments));
      return true;
    } catch (error) {
      console.error('Error deleting tournament:', error);
      return false;
    }
  }

  static async updateTournament(updatedTournament: Tournament): Promise<boolean> {
    try {
      const existingTournaments = await this.getTournaments();
      const updatedTournaments = existingTournaments.map(t => 
        t.id === updatedTournament.id ? updatedTournament : t
      );
      await AsyncStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(updatedTournaments));
      return true;
    } catch (error) {
      console.error('Error updating tournament:', error);
      return false;
    }
  }

  static async getTournamentCount(): Promise<number> {
    try {
      const tournaments = await this.getTournaments();
      return tournaments.length;
    } catch (error) {
      console.error('Error getting tournament count:', error);
      return 0;
    }
  }

  static async clearAllTournaments(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(TOURNAMENTS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing tournaments:', error);
      return false;
    }
  }
} 