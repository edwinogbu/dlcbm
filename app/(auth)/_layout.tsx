import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="Login" />
      <Stack.Screen name="Register" />
      <Stack.Screen name="ForgotPassword" />
      <Stack.Screen name="OTPVerification" />
      <Stack.Screen name="ResetPassword" />
    </Stack>
  );
}