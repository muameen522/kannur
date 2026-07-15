import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { loadData, saveData } from '../utils/storage';
import { generateId, dateKey } from '../utils/helpers';

const AppContext = createContext(null);

const initialState = {
  habits: [],
  challenges: [],
  onboardingComplete: false,
  notificationTime: '09:00',
  notificationsEnabled: true,
  loaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, loaded: true };

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

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadAllData().then((data) => {
      if (data) dispatch({ type: 'LOAD_STATE', payload: data });
      else dispatch({ type: 'LOAD_STATE', payload: { loaded: true } });
    });
  }, []);

  useEffect(() => {
    if (state.loaded) {
      persistState();
    }
  }, [state]);

  async function loadAllData() {
    const [habits, challenges, settings] = await Promise.all([
      loadData('habits'),
      loadData('challenges'),
      loadData('settings'),
    ]);
    if (!habits && !challenges && !settings) return null;
    return {
      habits: habits || [],
      challenges: challenges || [],
      ...settings,
      loaded: true,
    };
  }

  async function persistState() {
    const settings = {
      onboardingComplete: state.onboardingComplete,
      notificationTime: state.notificationTime,
      notificationsEnabled: state.notificationsEnabled,
    };
    await Promise.all([
      saveData('habits', state.habits),
      saveData('challenges', state.challenges),
      saveData('settings', settings),
    ]);
  }

  const addHabit = useCallback(
    (data) => dispatch({ type: 'ADD_HABIT', payload: data }),
    []
  );
  const updateHabit = useCallback((data) => dispatch({ type: 'UPDATE_HABIT', payload: data }), []);
  const deleteHabit = useCallback((id) => dispatch({ type: 'DELETE_HABIT', payload: id }), []);
  const checkHabit = useCallback((habitId, date) => {
    dispatch({ type: 'CHECK_HABIT', payload: { habitId, date } });
    return true;
  }, []);
  const addChallenge = useCallback(
    (data) => dispatch({ type: 'ADD_CHALLENGE', payload: data }),
    []
  );
  const completeChallenge = useCallback(
    (id) => dispatch({ type: 'COMPLETE_CHALLENGE', payload: id }),
    []
  );
  const deleteChallenge = useCallback(
    (id) => dispatch({ type: 'DELETE_CHALLENGE', payload: id }),
    []
  );
  const setOnboarding = useCallback(
    (val) => dispatch({ type: 'SET_ONBOARDING', payload: val }),
    []
  );
  const setSettings = useCallback(
    (val) => dispatch({ type: 'SET_SETTINGS', payload: val }),
    []
  );

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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
