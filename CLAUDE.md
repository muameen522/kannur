@AGENTS.md

## Quick Reference

The app is a habit tracker built with Expo SDK 57 + expo-router. See AGENTS.md for full architecture docs.
- 6 screens (home, create habit, habit detail, challenges, settings, onboarding)
- Core loop: check in → reward (animation + haptic + sound) → streak → challenge
- State persisted via AsyncStorage (Context + useReducer)
- Dark theme, two habit types (boolean once/day, volume ×N/day)

To test: `npm run web` for web preview, or `npx expo export --platform web` to build.
