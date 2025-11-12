import React from "react";
import { Stack } from "expo-router";
import { WebSocketProvider } from "../contexts/WebSocketContext";
import theme from "../utils/theme";
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <WebSocketProvider>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.warmBeige, flex: 1 }
      }} />
      <Toast />
    </WebSocketProvider>
  );
}
