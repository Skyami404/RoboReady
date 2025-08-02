import { StyleSheet } from 'react-native';
import { globalStyles, SPACING } from './globalStyles';

export const checklistStyles = StyleSheet.create({
  safeArea: globalStyles.safeArea,
  container: globalStyles.scrollContainer,
  scrollContent: globalStyles.scrollContent,
  title: globalStyles.screenTitle,
  progress: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: SPACING.lg, 
    color: '#90be6d', 
    textAlign: 'center' 
  },
  itemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.sm,
    backgroundColor: '#f8fafc',
    minHeight: 54,
    height: 54
  },
  itemText: { 
    fontSize: 16, 
    flexShrink: 1, 
    marginLeft: SPACING.sm, 
    flex: 1 
  },
  checkboxTouchable: {
    padding: SPACING.md,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTouchable: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    height: '100%',
    justifyContent: 'center'
  },
  checkboxContainer: {
    marginRight: 4,
    width: 38,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxUnchecked: {
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: '50%',
    width: 24,
    height: 24,
  },
  buttonContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.xl
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#f8fafc',
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: '#374151'
  },
  deleteButton: {
    margin: 0,
    padding: 0
  }
}); 