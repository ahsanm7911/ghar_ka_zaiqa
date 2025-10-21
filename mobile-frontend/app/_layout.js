import React from "react";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from "expo-status-bar";
import theme from "../utils/theme";


export default function Layout() {
  return (
    // <SafeAreaProvider>
        // <StatusBar style="dark" backgroundColor={theme.colors.warmBeige}/>
        <>
        <Stack screenOptions={{ headerShown: false,
          contentStyle: { backgroundColor: theme.colors.warmBeige, flex: 1}
        }} />
        <Toast />
        </>
    // </SafeAreaProvider>
  );
}
