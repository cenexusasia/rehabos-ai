import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f0f' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="auth/login"
            options={{ headerShown: true, headerTitle: 'Sign In', headerStyle: { backgroundColor: '#1a1a1a' }, headerTintColor: '#ffffff' }}
          />
          <Stack.Screen
            name="auth/signup"
            options={{ headerShown: true, headerTitle: 'Create Account', headerStyle: { backgroundColor: '#1a1a1a' }, headerTintColor: '#ffffff' }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
