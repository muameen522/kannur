import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import {
  loadAllFromCache,
  saveToCache,
  saveAllToCache,
  clearCache,
} from '../lib/cache';
import { generateId, dateKey } from '../utils/helpers';

const AppContext = createContext(null);

const initialState = {
  habits: [],
  challenges: [],
  onboardingComplete: false,
  notificationTime: '09:00',
  notificationsEnabled: true,
  loaded: false,
  user: null,
  session: null,
  authLoading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, loaded: true };

    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        authLoading: false,
      };

    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        session: null,
        habits: [],
        challenges: [],
        onboardingComplete: false,
      };

    case 'ADD_HABIT': {
      const habit = {
        id: generateId(),
        name: action.payload.name,
        emoji: action.payload.emoji || '📋',
        type: action.payload.type || 'boolean',
        targetCount: action.payload.type === 'volume' ? action.payload.targetCount : null,
        logs: {},
        createdAt: dateKey(),
      };
      return { ...state, habits: [...state.habits, habit] };
    }

    case 'UPDATE_HABIT': {
      const updated = action.payload;
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === updated.id ? { ...h, ...updated } : h)),
      };
    }

    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.payload),
      };

    case 'CHECK_HABIT': {
      const { habitId, date } = action.payload;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== habitId) return h;
          const logs = { ...h.logs };
          const existing = logs[date];
          if (h.type === 'boolean') {
            if (!existing) logs[date] = true;
          } else {
            if (!existing || typeof existing !== 'object') {
              logs[date] = { count: 1, target: h.targetCount };
            } else if (existing.count < h.targetCount) {
              logs[date] = { ...existing, count: existing.count + 1 };
            }
          }
          return { ...h, logs };
        }),
      };
    }

    case 'ADD_CHALLENGE': {
      const challenge = {
        id: generateId(),
        name: action.payload.name,
        duration: action.payload.duration,
        habitId: action.payload.habitId || null,
        startDate: dateKey(),
        completed: false,
        checkIns: {},
      };
      return { ...state, challenges: [...state.challenges, challenge] };
    }

    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };

    case 'COMPLETE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.payload ? { ...c, completed: true } : c
        ),
      };

    case 'DELETE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.filter((c) => c.id !== action.payload),
      };

    case 'SET_SETTINGS':
      return { ...state, ...action.payload };

    case 'SET_ONBOARDING':
      return { ...state, onboardingComplete: action.payload };

    default:
      return state;
  }
}

function getSettingsSlice(state) {
  return {
    onboardingComplete: state.onboardingComplete,
    notificationTime: state.notificationTime,
    notificationsEnabled: state.notificationsEnabled,
  };
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Auth ──────────────────────────────────────────────

  useEffect(() => {
    restoreSession();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch({
        type: 'SET_AUTH',
        payload: { user: session?.user ?? null, session },
      });
      if (session?.user) {
        saveToCache('user', { user: session.user, session });
        syncFromSupabase(session.user.id);
      } else {
        clearCache();
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  async function restoreSession() {
    const cached = await loadAllFromCache();
    if (cached.user) {
      dispatch({
        type: 'SET_AUTH',
        payload: { user: cached.user.user, session: cached.user.session },
      });
      if (cached.habits) dispatch({ type: 'LOAD_STATE', payload: { habits: cached.habits, challenges: cached.challenges || [], ...cached.settings, loaded: true } });
      if (cached.user.session) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          syncFromSupabase(session.user.id);
        }
      }
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch({
          type: 'SET_AUTH',
          payload: { user: session.user, session },
        });
        syncFromSupabase(session.user.id);
      } else {
        dispatch({ type: 'SET_AUTH', payload: { user: null, session: null } });
        dispatch({ type: 'LOAD_STATE', payload: { loaded: true } });
      }
    }
  }

  // ── Supabase sync ─────────────────────────────────────

  async function syncFromSupabase(userId) {
    try {
      const [habitsRes, challengesRes, settingsRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId),
        supabase.from('challenges').select('*').eq('user_id', userId),
        supabase.from('settings').select('*').eq('user_id', userId).single(),
      ]);

      const habits = habitsRes.data || [];
      const challenges = challengesRes.data || [];
      const settings = settingsRes.data || {};

      const merged = {
        habits: habits.map(normalizeHabit),
        challenges: challenges.map(normalizeChallenge),
        onboardingComplete: settings.onboarding_complete ?? state.onboardingComplete,
        notificationTime: settings.notification_time ?? state.notificationTime,
        notificationsEnabled: settings.notifications_enabled ?? state.notificationsEnabled,
        loaded: true,
      };

      dispatch({ type: 'LOAD_STATE', payload: merged });
      saveAllToCache({ habits: merged.habits, challenges: merged.challenges, settings: merged });
    } catch {
      // Silent fail — cache data is already displayed
    }
  }

  async function syncToSupabase() {
    const user = state.user;
    if (!user) return;

    try {
      await Promise.all([
        supabase.from('habits').upsert(
          state.habits.map((h) => ({ ...h, user_id: user.id, logs: JSON.stringify(h.logs) })),
          { onConflict: 'id' }
        ),
        supabase.from('challenges').upsert(
          state.challenges.map((c) => ({ ...c, user_id: user.id, checkIns: JSON.stringify(c.checkIns) })),
          { onConflict: 'id' }
        ),
        supabase.from('settings').upsert(
          {
            user_id: user.id,
            onboarding_complete: state.onboardingComplete,
            notification_time: state.notificationTime,
            notifications_enabled: state.notificationsEnabled,
          },
          { onConflict: 'user_id' }
        ),
      ]);
    } catch {
      // Silent fail — will retry on next mutation
    }
  }

  function normalizeHabit(h) {
    return { ...h, logs: typeof h.logs === 'string' ? JSON.parse(h.logs) : (h.logs || {}) };
  }

  function normalizeChallenge(c) {
    return { ...c, checkIns: typeof c.checkIns === 'string' ? JSON.parse(c.checkIns) : (c.checkIns || {}) };
  }

  // ── Persistence: cache instantly, sync to supabase in background ──

  useEffect(() => {
    if (state.loaded) {
      persistLocally();
    }
  }, [state.habits, state.challenges, state.onboardingComplete, state.notificationTime, state.notificationsEnabled]);

  const persistLocally = useCallback(async () => {
    await saveAllToCache({
      habits: state.habits,
      challenges: state.challenges,
      settings: getSettingsSlice(state),
    });
  }, [state.habits, state.challenges, state]);

  // Sync to Supabase when app goes to background / on mutations
  useEffect(() => {
    if (!state.loaded || !state.user) return;
    const timer = setTimeout(() => syncToSupabase(), 2000);
    return () => clearTimeout(timer);
  }, [state.habits, state.challenges, state.onboardingComplete, state.notificationTime]);

  useEffect(() => {
    if (!state.user) return;
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') syncToSupabase();
    });
    return () => sub.remove();
  }, [state.user, state.habits, state.challenges]);

  // ── Auth actions ──────────────────────────────────────

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  // ── App actions ───────────────────────────────────────

  const addHabit = useCallback((data) => dispatch({ type: 'ADD_HABIT', payload: data }), []);
  const updateHabit = useCallback((data) => dispatch({ type: 'UPDATE_HABIT', payload: data }), []);
  const deleteHabit = useCallback((id) => dispatch({ type: 'DELETE_HABIT', payload: id }), []);
  const checkHabit = useCallback((habitId, date) => {
    dispatch({ type: 'CHECK_HABIT', payload: { habitId, date } });
    return true;
  }, []);

  const addChallenge = useCallback((data) => dispatch({ type: 'ADD_CHALLENGE', payload: data }), []);
  const completeChallenge = useCallback((id) => dispatch({ type: 'COMPLETE_CHALLENGE', payload: id }), []);
  const deleteChallenge = useCallback((id) => dispatch({ type: 'DELETE_CHALLENGE', payload: id }), []);
  const setOnboarding = useCallback((val) => dispatch({ type: 'SET_ONBOARDING', payload: val }), []);
  const setSettings = useCallback((val) => dispatch({ type: 'SET_SETTINGS', payload: val }), []);

  const value = {
    state,
    addHabit,
    updateHabit,
    deleteHabit,
    checkHabit,
    addChallenge,
    completeChallenge,
    deleteChallenge,
    setOnboarding,
    setSettings,
    signIn,
    signUp,
    signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
