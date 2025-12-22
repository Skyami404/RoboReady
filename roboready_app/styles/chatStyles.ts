import { StyleSheet, Platform } from 'react-native';
import { getCommonColors, spacing, borderRadius } from './commonStyles';

export const createChatStyles = (isDarkMode: boolean) => {
  const colors = getCommonColors(isDarkMode);
  
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#F5F5F5',
    },
    container: {
      flex: 1,
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      padding: spacing.md,
      paddingBottom: spacing.lg,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
      borderBottomRightRadius: 4,
    },
    assistantBubble: {
      alignSelf: 'flex-start',
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 4,
    },
    userText: {
      color: '#ffffff',
    },
    assistantText: {
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    timestamp: {
      fontSize: 11,
      marginTop: 4,
    },
    userTimestamp: {
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'right',
    },
    assistantTimestamp: {
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      textAlign: 'left',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: spacing.md,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#374151' : '#e5e7eb',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      backgroundColor: isDarkMode ? '#2d2d2d' : '#f8fafc',
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginRight: spacing.sm,
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#000000',
      borderWidth: 1,
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDarkMode ? '#2d2d2d' : '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
};