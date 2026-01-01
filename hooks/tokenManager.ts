import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/hooks/api";

const FIVE_MINUTES = 5 * 60 * 1000;

export const checkAndRefreshIdToken = async (): Promise<string | null> => {
  console.log("🔍 [Auth] Checking token from cache...");

  const [
    idToken,
    refreshToken,
    tokenExpiration,
  ] = await AsyncStorage.multiGet([
    "idToken",
    "refreshToken",
    "tokenExpiration",
  ]).then(entries => entries.map(e => e[1]));

  if (!idToken || !refreshToken || !tokenExpiration) {
    console.warn("❌ [Auth] Missing token info");
    return null;
  }

  const expiresAt = Number(tokenExpiration);
  const isExpired = Date.now() >= expiresAt - FIVE_MINUTES;

  console.log("🕒 Token expires at:", new Date(expiresAt).toLocaleString());
  console.log("⚠️ Is token expired or near expiry?", isExpired);

  // ✅ Token còn hạn → dùng luôn
  if (!isExpired) {
    console.log("✅ Token still valid, using cached token");
    return idToken;
  }

  // 🔁 Token hết hạn → refresh
  console.log("🔄 Token expired, refreshing...");

  try {
    console.log('🟢 [REFRESH_TOKEN_URL] API_URL:', API_URL.REFRESH_TOKEN_URL.toString());
    const res = await fetch(API_URL.REFRESH_TOKEN_URL.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.error("❌ Refresh failed:", res.status);
      return null;
    }

    const data = await res.json();

    if (!data.idToken) {
      console.error("❌ No idToken returned from refresh");
      return null;
    }

    const newExpiration = Date.now() + 3600 * 1000;

    await AsyncStorage.multiSet([
      ["idToken", data.idToken],
      ["tokenExpiration", String(newExpiration)],
      ...(data.refreshToken ? [["refreshToken", data.refreshToken]] : []),
    ]);

    console.log("✅ Token refreshed successfully");
    return data.idToken;
  } catch (err) {
    console.error("❌ Exception during refresh:", err);
    return null;
  }
};
