import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="benchmarks" />
        <Stack.Screen name="build-wod" />
        <Stack.Screen name="log" />
        <Stack.Screen name="gym" />
        <Stack.Screen name="gym-strength" />
        <Stack.Screen name="gym-cardio" />
      </Stack>
      {/* "auto" = light text on our dark ground, dark text on the light ground. */}
      <StatusBar style="auto" />
    </>
  );
}
