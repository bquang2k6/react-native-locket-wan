import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useCheckAuth } from "@/hooks/useCheckAuth";

export default function AuthLayout() {
  const { loading, isAuth } = useCheckAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isAuth) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
