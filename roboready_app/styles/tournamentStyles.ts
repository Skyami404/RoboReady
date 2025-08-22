import { StyleSheet } from 'react-native';
import { createCommonStyles, getCommonColors, spacing, borderRadius } from './commonStyles';

export const createTournamentStyles = (isDarkMode: boolean) => {
  const commonStyles = createCommonStyles(isDarkMode);
  const colors = getCommonColors(isDarkMode);
  
  return StyleSheet.create({
      formContainer: {
      paddingVertical: spacing.lg,
    },
    input: {
      marginBottom: 15,
    },
      addButton: {
      marginTop: spacing.sm,
      borderRadius: borderRadius.md,
      minWidth: 120,
      alignSelf: 'center',
    },
      permissionContainer: {
      backgroundColor: isDarkMode ? '#1e3a8a' : '#e3f2fd',
      padding: 15,
      marginVertical: spacing.lg,
      borderRadius: borderRadius.md,
      borderLeftWidth: 4,
      borderLeftColor: isDarkMode ? '#3b82f6' : '#2196f3',
    },
    permissionText: {
      fontSize: 14,
      color: isDarkMode ? '#93c5fd' : '#1976d2',
      marginBottom: spacing.sm,
    },
  settingsButton: {
    alignSelf: 'flex-start',
  },
        tournamentList: {
    marginTop: spacing.lg,
    marginBottom: 5,
    
  },
    tournamentCard: {
      marginBottom: 10,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    },
    subtitle: {
      ...commonStyles.subtitle,
    },
    description: {
      ...commonStyles.description,
    },
      titleContainer: {
    ...commonStyles.titleContainer,
  },
  sectionTitle: {
    ...commonStyles.title,
    marginBottom: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
      datePickerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      borderTopWidth: 2,
      borderTopColor: isDarkMode ? '#374151' : '#d1d5db',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  });
  }; 