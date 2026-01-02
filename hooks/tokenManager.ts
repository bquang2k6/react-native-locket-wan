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

  if (!idToken || !refreshToken) {
    console.warn("❌ [Auth] Missing idToken or refreshToken");
    return null;
  }

  const expiresAt = tokenExpiration ? Number(tokenExpiration) : 0;
  const isExpired = !tokenExpiration || Date.now() >= expiresAt - FIVE_MINUTES;

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

    const resData = await res.json();

    // Proxy returns { success: true, data: { id_token: "...", ... } }
    const freshToken = resData.idToken || resData.data?.id_token || resData.data?.idToken;

    if (!freshToken) {
      console.error("❌ No idToken returned from refresh. Response:", JSON.stringify(resData));
      return null;
    }

    const newExpiration = Date.now() + 3600 * 1000;
    const newRefreshToken = resData.refreshToken || resData.data?.refresh_token || refreshToken;

    // Update individual keys
    await AsyncStorage.multiSet([
      ["idToken", freshToken],
      ["tokenExpiration", String(newExpiration)],
      ["refreshToken", newRefreshToken],
    ]);

    // Update the unified 'user' object to keep everything in sync
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.idToken = freshToken;
        user.refreshToken = newRefreshToken;
        await AsyncStorage.setItem("user", JSON.stringify(user));
        console.log("✅ Unified 'user' object updated");
      }
    } catch (e) {
      console.warn("⚠️ Failed to update unified user object:", e);
    }

    console.log("✅ Token refreshed successfully. New token ends with:", freshToken.slice(-10));
    return freshToken;
  } catch (err) {
    console.error("❌ Exception during refresh:", err);
    return null;
  }
};
