# Habit Tracker

A mobile habit tracking app built with **Expo SDK 57** (React Native 0.86, React 19).

## Features

- Create habits (boolean once/day or volume ×N/day)
- Daily check-in with reward animations, haptics, and sound
- Streak tracking with milestone celebrations
- 30-day consistency charts
- Built-in challenges (3/7/14/21/30 day)
- Dark theme UI
- Daily notification reminders
- First-launch onboarding walkthrough

## Tech Stack

- **Framework**: Expo SDK ~57.0.4 + expo-router (file-based routing)
- **Language**: JavaScript (Hermes engine)
- **Charts**: react-native-chart-kit + react-native-svg
- **Notifications**: expo-notifications
- **State**: React Context + useReducer + AsyncStorage persistence

## Screens

| Screen | Route |
|---|---|
| Home Dashboard | `app/index.js` |
| Create Habit | `app/create-habit.js` |
| Habit Detail | `app/habit/[id].js` |
| Challenges | `app/challenges.js` |
| Settings | `app/settings.js` |
| Onboarding | `app/onboarding.js` |

## Getting Started

```bash
npm install
npx expo start --web
```

- **Web**: http://localhost:8081
- **Android**: Scan QR code with Expo Go
- **iOS**: Scan QR code with Expo Go (macOS only)

## Commands

| Action | Command |
|---|---|
| Start dev server | `npm start` |
| Web preview | `npm run web` |
| Android | `npm run android` |
| iOS | `npm run ios` |

## License

MIT
