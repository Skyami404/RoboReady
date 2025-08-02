import { StyleSheet } from 'react-native';
import { createCommonStyles, getCommonColors, spacing, borderRadius } from './commonStyles';

export const createHomeStyles = (isDarkMode: boolean) => {
  const commonStyles = createCommonStyles(isDarkMode);
  const colors = getCommonColors(isDarkMode);
  
    return StyleSheet.create({
    container: {
      ...commonStyles.container,
    },
      header: {
    marginBottom: spacing.lg,
  },
    title: {
      ...commonStyles.title,
      fontSize: 32,
      marginBottom: spacing.sm,
    },
      subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  widgetContainer: {
    marginBottom: 16,
  },
      widget: {
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      ...commonStyles.shadow,
    },
      widgetLight: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    widgetDark: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
  
      widgetTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    widgetDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: spacing.md,
    },
  widgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
      statNumber: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    statNumberSmall: {
      fontSize: 14,
      maxWidth: 120, // Matches UPCOMING_EVENT_NAME_MAX_LENGTH * 8 (approximate character width)
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
      progressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
      footerText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
  }; 