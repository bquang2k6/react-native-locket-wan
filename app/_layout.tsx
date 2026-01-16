import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
  Theme,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useExpoUpdate } from "@/hooks/useExpoUpdate";
import { useEffect } from "react";


function RootLayoutNav() {
  const { themeName, colors } = useTheme();
  const { checkForUpdates } = useExpoUpdate();

  useEffect(() => {
    // Tự động kiểm tra cập nhật khi vào app (chỉ chạy trong bản build)
    checkForUpdates();
  }, []);


  // Create a React Navigation theme based on our selected theme colors
  const navTheme: Theme = {
    dark: themeName === 'dark' || colors["base-100"] === '#000000' || colors["base-100"] === '#1d232a', // Approximation
    colors: {
      primary: colors.primary,
      background: colors["base-100"],
      card: colors["base-200"],
      text: colors["base-content"],
      border: colors["base-300"],
      notification: colors.accent,
    },
    fonts: DefaultTheme.fonts, // Inherit default fonts for now
  };

  return (
    <NavThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={navTheme.dark ? "light" : "dark"} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
