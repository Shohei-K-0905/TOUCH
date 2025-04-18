import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
        // Hide the header completely
        header: () => null,
        title: "",
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false,
          title: "",
          // Explicitly hide the header
          header: () => null,
        }}
      />
      <Stack.Screen 
        name="login" 
        options={{
          headerShown: false,
          title: "ログイン",
          header: () => null,
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          headerShown: false,
          title: "アカウント作成",
          header: () => null,
        }}
      />
    </Stack>
  );
}