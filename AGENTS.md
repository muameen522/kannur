# Habit Tracker — Expo SDK 57 (expo-router)

## Framework
- **Expo SDK ~57.0.4**, React Native 0.86, React 19.2.3 (Hermes engine)
- **expo-router** file-based routing in `app/` directory — entry point is `expo-router/entry`
- Web support active (`react-dom`, `react-native-web`, `@expo/metro-runtime`)

## Screens (7 total)
| Screen | Route | Purpose |
|---|---|---|
| Auth | `app/auth.js` | Sign in / Sign up |
| Home Dashboard | `app/index.js` | Today's habits, stats, check-in, challenge banner |
| Create Habit | `app/create-habit.js` | New habit form (emoji picker, type: boolean/volume) |
| Habit Detail | `app/habit/[id].js` | History, 30-day chart, streaks, stats |
| Challenges | `app/challenges.js` | Active challenges, preset challenge launcher |
| Settings | `app/settings.js` | Notifications toggle, reminder time, about, sign out, reset |
| Onboarding | `app/onboarding.js` | First-launch walkthrough + quick 3-day challenge |

## Architecture
- **Auth + Backend**: Supabase (`@supabase/supabase-js`) in `src/lib/supabase.js`
- **State**: React Context + `useReducer` in `src/context/AppContext.js`
- **Persistence (Cache)**: `@react-native-async-storage/async-storage` via `src/lib/cache.js`
  - Load from cache instantly on app open (snappy)
  - Sync to Supabase in background after mutations
  - Sync on app background / state change
- **Theme**: Dark theme constants in `src/constants/theme.js`
- **Reward System**: `RewardOverlay` component (animated popup) + haptics (`expo-haptics`) + sound (`expo-av`)
- **Charts**: `react-native-chart-kit` with `react-native-svg` (30-day consistency line chart)
- **Notifications**: `expo-notifications` daily schedule with configurable time

## Core Loop
1. User signs in / signs up (Supabase Auth)
2. Create habit → choose type (boolean once/day or volume ×N/day)
3. Daily check-in → reward (scale animation + haptic + sound + streak update)
4. Streak milestones → bonus celebration (7-day, 3-day, first check-in)
5. Challenges (3/7/14/21/30 day) → progress tracking → completion celebration
6. All data cached locally (instant) + synced to Supabase (background)

## Setup
Before running, update `src/lib/supabase.js` with your Supabase project credentials:
```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

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
