# Long Distance Love - iOS App

A beautiful iOS application for long-distance couples to track special dates and count down to your next meeting.

## Prerequisites

Before you begin, make sure you have:

1. **macOS** (required for iOS development)
2. **Node.js** (v18 or higher)
3. **Xcode** (latest version from the App Store)
4. **CocoaPods** (install with `sudo gem install cocoapods`)
5. **React Native CLI** (install with `npm install -g react-native-cli`)

## Setup Instructions

### 1. Install Dependencies

```bash
cd mobile
npm install
cd ios
pod install
cd ..
```

### 2. Start the Backend Server

The app needs the backend server running. In a new terminal:

```bash
cd ../backend
npm start
```

The backend will run on `http://localhost:5001`

### 3. Configure API URL (if testing on a real device)

If you're testing on a physical iPhone (not the simulator), you need to update the API URL:

1. Find your computer's IP address:
   ```bash
   ipconfig getifaddr en0
   ```

2. Open `mobile/App.js` and replace:
   ```javascript
   const API_URL = 'http://localhost:5001/api';
   ```
   with:
   ```javascript
   const API_URL = 'http://YOUR_IP_ADDRESS:5001/api';
   ```

### 4. Run the App

**On iOS Simulator:**
```bash
npm run ios
```

**On a specific iPhone model:**
```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

**On a physical iPhone:**
1. Connect your iPhone via USB
2. Open the project in Xcode:
   ```bash
   open ios/LongDistanceLove.xcworkspace
   ```
3. Select your device from the device menu
4. Click the Run button or press Cmd+R

## Features

- **Live Countdown Timer**: Real-time countdown to your next special event
- **Relationship Statistics**: Track how long you've been together, time since last meeting, and days until next meeting
- **Event Calendar**: Add and manage important dates with descriptions
- **Beautiful UI**: Native iOS design with smooth animations
- **Persistent Data**: All data is saved on your backend server

## Troubleshooting

### Port 5000 Already in Use
macOS AirPlay uses port 5000 by default. This app uses port 5001 instead.

### Metro Bundler Issues
If you encounter bundler issues:
```bash
npm start -- --reset-cache
```

### Pod Install Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Build Fails in Xcode
1. Clean build folder: Product > Clean Build Folder (Cmd+Shift+K)
2. Delete derived data
3. Rebuild

## Project Structure

```
mobile/
├── App.js                  # Main app component
├── src/
│   └── components/
│       ├── Countdown.js    # Countdown timer component
│       ├── Statistics.js   # Statistics display component
│       └── Calendar.js     # Event calendar component
├── ios/                    # iOS-specific files
├── android/                # Android-specific files (for future)
└── package.json            # Dependencies
```

## Development

### Hot Reloading
- Shake your device or press Cmd+D in the simulator
- Select "Enable Fast Refresh"

### Debug Menu
- Simulator: Press Cmd+D
- Physical Device: Shake the device

## Building for Production

### Create a Release Build

1. Open Xcode:
   ```bash
   open ios/LongDistanceLove.xcworkspace
   ```

2. Select "Any iOS Device" or your connected device

3. Go to Product > Archive

4. Follow the prompts to upload to App Store Connect

### Update Version
Edit `ios/LongDistanceLove/Info.plist` to change:
- CFBundleShortVersionString (version number)
- CFBundleVersion (build number)

## Notes

- The app connects to a local backend server, so both your iPhone and computer must be on the same WiFi network when testing on a physical device
- For production, you'll want to deploy the backend to a cloud service (Heroku, AWS, etc.) and update the API_URL

## Future Enhancements

- Push notifications for upcoming events
- Photo sharing for events
- Widget support for iOS home screen
- iCloud sync
- Dark mode support

---

Made with love for long-distance relationships ❤️
