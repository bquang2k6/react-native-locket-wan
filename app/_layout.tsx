import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCheckAuth } from "@/hooks/useCheckAuth";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { loading, isAuth } = useCheckAuth();

  if (loading) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuth ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="Login" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
