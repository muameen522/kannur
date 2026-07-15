import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AppProvider, useApp } from '../src/context/AppContext';
import { colors } from '../src/constants/theme';

function RootNavigator() {
  const { state } = useApp();
  const { authLoading, user } = state;

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        {!user ? (
          <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        ) : (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="create-habit"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="habit/[id]" />
            <Stack.Screen name="challenges" />
            <Stack.Screen name="settings" />
          </>
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
