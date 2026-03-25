import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="Onboarding1" />
      <Stack.Screen name="Onboarding2" />
      <Stack.Screen name="Onboarding3" />
      <Stack.Screen name="Onboarding4" />
    </Stack>
  );
}

// import { Stack } from 'expo-router';

// export default function OnboardingLayout() {
//   return (
//     <Stack
//       screenOptions={{
//         headerShown: false,
//         animation: 'slide_from_right',
//       }}
//     />
//   );
// }

