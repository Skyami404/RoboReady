# RoboReady - VEX Tournament Checklist App

A comprehensive tournament management app for VEX Robotics teams, helping you stay organized and prepared for competitions.

## Features

### 🏆 Tournament Management
- **Add tournaments** with custom dates, times, and locations
- **Edit existing tournaments** - update any details anytime
- **Calendar integration** - automatically adds events to your device calendar
- **Smart reminders** - customizable notifications (minutes, hours, or days before)

### 📋 Checklist System
- **Tournament Day Checklist** - final preparations and equipment checks
- **Week Before Checklist** - pre-tournament planning and preparation
- **Custom items** - add your own checklist items
- **Progress tracking** - see completion percentage at a glance

### 🎨 User Experience
- **Dark/Light Mode** - toggle between themes with the sun/moon button
- **Responsive design** - works on all phone sizes
- **Intuitive interface** - easy-to-use calendar-style date picker
- **Export functionality** - save checklists as PDF

### 🔔 Smart Notifications
- **Multiple reminder options** - from 5 minutes to 1 week before
- **Custom timing** - set any number of days/hours/minutes
- **Banner notifications** - clear, visible reminders
- **Test notifications** - verify everything works before tournaments

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/VEX_Checklist.git
   cd VEX_Checklist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Usage

### Adding a Tournament
1. Navigate to the "Tournaments" tab
2. Tap "Add Tournament"
3. Enter tournament name (required)
4. Set date and time using the improved date picker
5. Add location (optional)
6. Choose reminder timing (preset options or custom)
7. Save to add to calendar with notifications

### Using Checklists
1. Go to "Tournament Day" or "Week Before" tabs
2. Check off completed items
3. Add custom items as needed
4. Export as PDF for sharing with team

### Testing Notifications
1. Tap "Test Notifications" button
2. Wait 5 seconds for test notification
3. Ensure device is not in silent mode

## Permissions

The app requires the following permissions:
- **Calendar access** - to add tournament events
- **Notifications** - to send reminder alerts
- **Storage** - to save checklist progress

## Publishing

### Build for Production
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS/Android
eas build --platform ios
eas build --platform android
```

### App Store Deployment
1. Update `app.json` with your project ID
2. Add app icons and splash screens to `./assets/`
3. Configure signing certificates
4. Submit to App Store/Google Play

## Technical Details

### Built With
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Navigation** - Navigation between screens
- **React Native Paper** - Material Design components
- **Expo Notifications** - Push notification system
- **Expo Calendar** - Calendar integration

### Architecture
- **TypeScript** - Type-safe development
- **Context API** - Theme management
- **AsyncStorage** - Local data persistence
- **Modular components** - Reusable UI elements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@roboready.app or create an issue in this repository.

## Version History

- **v1.0.0** - Initial release with tournament management and checklists
- Features: Dark mode, calendar integration, notifications, PDF export

---

**RoboReady** - Stay prepared, stay competitive! 🤖🏆 