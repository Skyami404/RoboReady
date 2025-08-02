import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Define consistent spacing values
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Define consistent container padding based on screen size
const getContainerPadding = () => {
  if (screenWidth < 375) {
    return SPACING.lg; // 16px for smaller screens
  } else if (screenWidth < 768) {
    return SPACING.xl; // 20px for standard phones
  } else {
    return SPACING.xxl; // 24px for larger screens/tablets
  }
};

export const globalStyles = StyleSheet.create({
  // Safe area container for all screens
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Main container with consistent padding
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: getContainerPadding(),
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  
  // Scrollable container for screens that need scrolling
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: getContainerPadding(),
  },
  
  // Content wrapper inside scroll views
  scrollContent: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl, // Extra bottom padding for tab bar
  },
  
  // Title styling consistent across screens
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
    textAlign: 'center',
    color: '#000',
  },
  
  // Section spacing
  section: {
    marginBottom: SPACING.xl,
  },
  
  // Button container with proper spacing
  buttonContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  
  // Horizontal padding for nested content that needs less padding
  contentPadding: {
    paddingHorizontal: SPACING.sm,
  },
});

export default globalStyles;