import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/colors';
import { Home, Video, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
      // 初期タブを診療画面に設定
      initialRouteName="consultations"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultations"
        options={{
          title: '診療',
          tabBarIcon: ({ color, size }) => (
            <Video size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}