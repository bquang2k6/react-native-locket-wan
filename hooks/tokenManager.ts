import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_URL } from "@/hooks/api";

const BUFFER_SECONDS = 300; // 5 phút dự phòng

/**
 * Lưu tokens vào storage
 */
export const saveToken = async (tokens: {
  idToken: string;
  refreshToken: string;
  localId?: string;
  uid?: string;
}) => {
  try {
    const expiration = Date.now() + 3600 * 1000; // Mặc định 1 giờ
    const localId = tokens.localId || tokens.uid || "";

    await AsyncStorage.multiSet([
      ["idToken", tokens.idToken],
      ["refreshToken", tokens.refreshToken],
      ["localId", localId],
      ["tokenExpiration", String(expiration)],
      ["user", JSON.stringify({ ...tokens, localId })],
    ]);
    console.log("✅ [Auth] Tokens saved successfully");
  } catch (err) {
    console.error("❌ [Auth] Error saving tokens:", err);
  }
};

/**
 * Kiểm tra idToken và tự động refresh nếu gần hết hạn
 */
export const checkAndRefreshIdToken = async (): Promise<string | null> => {
  console.log("🔍 [Auth] Checking token from cache...");

  try {
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

    // 1. Kiểm tra định dạng JWT
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      console.error("❌ [Auth] idToken không đúng định dạng JWT");
      return null;
    }

    // 2. Decode và kiểm tra exp
    const decoded: any = jwtDecode(idToken);
    if (!decoded.exp) return idToken; // Không có exp thì dùng luôn (dù hơi lạ)

    const currentTime = Date.now() / 1000;
    const timeLeft = decoded.exp - currentTime;

    console.log(`⏳ Token có giá trị trong ${Math.max(0, Math.floor(timeLeft))}s`);

    // 3. Nếu còn hạn > BUFFER_SECONDS thì trả về idToken cũ
    if (decoded.exp > currentTime + BUFFER_SECONDS) {
      return idToken;
    }

    // 4. Sắp hết hạn -> Refresh
    console.log("🔄 [API] Token Gần hết hạn, cần làm mới...");
    const res = await axios.post(API_URL.REFRESH_TOKEN_URL.toString(), {
      refreshToken,
    });

    if (res.status !== 200 || !res.data?.data?.id_token) {
      console.error("❌ [Auth] Refresh failed:", res.status, res.data);
      return null;
    }

    const updatedTokens = {
      idToken: res.data.data.id_token,
      refreshToken: res.data.refresh_token || refreshToken,
      localId: res.data.data.user_id || res.data.data.localId,
    };

    await saveToken(updatedTokens);
    return updatedTokens.idToken;

  } catch (err) {
    console.error("❌ [Auth] Error checking/refreshing token:", err);
    return null;
  }
};
