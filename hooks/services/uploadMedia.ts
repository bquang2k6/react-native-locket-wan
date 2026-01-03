import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/hooks/api";

export interface MediaUploadPayload {
  userData: {
    idToken: string;
    localId: string;
  };
  mediaInfo: {
    type: "image" | "video";
    file: {
      uri: string;
      name: string;
      type: string;
    };
  };
  options: {
    caption?: string;
    [key: string]: any;
  };
  onProgress?: (progress: number) => void;
}

/**
 * Upload media to Locket API
 * Based on the "upload principle" from locketService.js and PostMoments.js
 */
export const uploadMedia = async (payload: MediaUploadPayload) => {
  const { userData, mediaInfo, options } = payload;
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    const fileType = mediaInfo.type;

    // 1. Set timeout based on file type
    const timeoutDuration = fileType === "image" ? 10000 : 30000; // Native might need more time
    timeoutId = setTimeout(() => {
      console.log("⏳ Uploading is taking longer than expected...");
    }, timeoutDuration) as any;

    // 2. Get user plan for plan_id
    const userPlanStr = await AsyncStorage.getItem("userPlan");
    let plan_id = "free";
    if (userPlanStr) {
      try {
        const userPlan = JSON.parse(userPlanStr);
        plan_id = userPlan.plan_id || "free";
      } catch (e) {
        console.error("Error parsing userPlan from AsyncStorage:", e);
      }
    }

    // 3. Streak update logic
    const today = new Date();
    const todayString =
      today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');

    const lastUpdatedStr = await AsyncStorage.getItem("last_updated_yyyymmdd");
    const lastUpdated = lastUpdatedStr ? parseInt(lastUpdatedStr) : 0;
    const todayInt = parseInt(todayString);

    // Default options to match successful payload
    const defaultOptions: { [key: string]: any } = {
      caption: "",
      overlay_id: "standard",
      type: "default",
      icon: "",
      text_color: "#FFFFFF",
      color_top: "",
      color_bottom: "",
      audience: "all",
      recipients: [],
    };

    const updatedOptions = { ...defaultOptions, ...options };

    if (lastUpdated !== todayInt) {
      updatedOptions.update_streak_for_yyyymmdd = todayInt;
      console.log("📅 Streak update added for date:", todayString);
    } else {
      console.log("📅 Same day upload, no streak update needed");
    }

    // 1. Initial Logging
    console.log("🚀 uploadMedia service called for:", fileType);

    // 4. Robust Token Retrieval: Prefer standalone keys to avoid stale "user" object issues
    let activeIdToken = userData.idToken;
    let activeUserId = userData.localId;

    try {
      const { checkAndRefreshIdToken } = require("../tokenManager");
      const freshIdToken = await checkAndRefreshIdToken();
      if (freshIdToken) {
        activeIdToken = freshIdToken;
        console.log("🔄 Token refreshed/verified via tokenManager");
      }
    } catch (e) {
      console.warn("⚠️ tokenManager failed, falling back to basic AsyncStorage keys:", e);
      const [storedIdToken, storedLocalId] = await AsyncStorage.multiGet(["idToken", "localId"])
        .then(entries => entries.map(e => e[1]));

      if (storedIdToken && storedIdToken.length > 100) activeIdToken = storedIdToken;
      if (storedLocalId) activeUserId = storedLocalId;
    }

    if (!activeIdToken || activeIdToken.length < 100) {
      throw new Error("Invalid or missing session token. Please log out and in again.");
    }

    console.log("📝 Final Upload Token (last 20):", activeIdToken.slice(-2000));

    // 5. Construct FormData EXACTLY like the user's working sample
    const formData = new FormData();
    formData.append("userId", activeUserId);
    formData.append("idToken", activeIdToken);

    // FIX: Extract caption strictly as a string to avoid nested {"caption":{"caption":"..."}} objects
    const rawCaption = options.caption;
    const finalCaption = typeof rawCaption === 'object' && rawCaption !== null
      ? ((rawCaption as any).caption || "")
      : (rawCaption || "");

    // Final options for JSON stringify
    const finalOptions: any = {
      ...updatedOptions,
      update_streak_for_yyyymmdd: todayInt,
    };

    formData.append("options", JSON.stringify(finalOptions));
    formData.append("caption", finalCaption);
    formData.append("plan_id", plan_id);

    // 5. Add media file (MUST be the last field)
    const fileToUpload = {
      uri: mediaInfo.file.uri,
      name: mediaInfo.file.name,
      type: mediaInfo.file.type || (fileType === "image" ? "image/jpeg" : "video/mp4"),
    } as any;

    formData.append(fileType === "image" ? "images" : "videos", fileToUpload);

    // 6. Execute Request via axios (proven working for connectivity)
    const url = API_URL.UPLOAD_MEDIA_URL.toString();
    console.log("🚀 Executing POST request (Axios) to:", url);

    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data, // Essential for RN FormData
      onUploadProgress: (progressEvent) => {
        if (payload.onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          payload.onProgress(percentCompleted);
        }
      },
    });

    if (timeoutId) clearTimeout(timeoutId);

    const resData = response.data;

    // 7. Success check
    const locketRes = resData?.data?.result;
    const locketStatus = locketRes?.status;

    if (response.status === 200 && (locketStatus === 200 || !locketStatus)) {
      console.log("✅ Upload successful!");
      if (lastUpdated !== todayInt) {
        await AsyncStorage.setItem("last_updated_yyyymmdd", todayString);
      }
      return resData;
    }

    // 8. Error handling
    console.error("❌ Upload failed.");
    console.error("📡 Proxy Status:", response.status);
    console.error("📡 Locket Status:", locketStatus || "N/A");
    if (locketRes?.errors) {
      console.error("❗ Locket Errors:", JSON.stringify(locketRes.errors));
    }

    if (locketStatus === 401) {
      throw new Error("Locket API 401: Malformed request or invalid token.");
    }
    throw new Error(`Upload failed with status ${response.status}`);

  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error("❌ Upload service error:", error.message || error);
    throw error;
  }
};
