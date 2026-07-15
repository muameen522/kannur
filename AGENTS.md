# Habit Tracker — Expo SDK 57 (expo-router)

## Framework
- **Expo SDK ~57.0.4**, React Native 0.86, React 19.2.3 (Hermes engine)
- **expo-router** file-based routing in `app/` directory — entry point is `expo-router/entry`
- Web support active (`react-dom`, `react-native-web`, `@expo/metro-runtime`)

## Screens (6 total — surface-area constraint)
| Screen | Route | Purpose |
|---|---|---|
| Home Dashboard | `app/index.js` | Today's habits, stats, check-in, challenge banner |
| Create Habit | `app/create-habit.js` | New habit form (emoji picker, type: boolean/volume) |
| Habit Detail | `app/habit/[id].js` | History, 30-day chart, streaks, stats |
| Challenges | `app/challenges.js` | Active challenges, preset challenge launcher |
| Settings | `app/settings.js` | Notifications toggle, reminder time, about, reset |
| Onboarding | `app/onboarding.js` | First-launch walkthrough + quick 3-day challenge |

## Architecture
- **State**: React Context + `useReducer` in `src/context/AppContext.js`
- **Persistence**: `@react-native-async-storage/async-storage` (habits, challenges, settings)
- **Theme**: Dark theme constants in `src/constants/theme.js`
- **Reward System**: `RewardOverlay` component (animated popup) + haptics (`expo-haptics`) + sound (`expo-av`)
- **Charts**: `react-native-chart-kit` with `react-native-svg` (30-day consistency line chart)
- **Notifications**: `expo-notifications` daily schedule with configurable time

## Core Loop
1. Create habit → choose type (boolean once/day or volume ×N/day)
2. Daily check-in → reward (scale animation + haptic + sound + streak update)
3. Streak milestones → bonus celebration (7-day, 3-day, first check-in)
4. Challenges (3/7/14/21/30 day) → progress tracking → completion celebration

## Commands
| Action | Command |
|---|---|
| Start dev server | `npm start` or `npx expo start` |
| Web preview | `npm run web` or `npx expo start --web` |
| Web export | `npx expo export --platform web` |
| Android device | `npm run android` |
| iOS device (macOS) | `npm run ios` |

## Important
- **Read versioned Expo docs** at https://docs.expo.dev/versions/v57.0.0/ before writing code
- Dependency installs: `npx expo install <pkg> -- --legacy-peer-deps`
- Dev environment: Windows (PowerShell)
- Package manager: npm (no yarn/pnpm lockfiles)
- No tests, lint, or typecheck infrastructure exists
