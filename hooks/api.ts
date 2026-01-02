// backendConfig.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

/**
 * =========================
 * Base URLs
 * =========================
 */
let BASE_API_URL =
  Constants.expoConfig?.extra?.BASE_API_URL ||
  process.env.EXPO_PUBLIC_BASE_API_URL ||
  "https://api.locketcamera.com";

let BASE_WS_API_URL =
  process.env.EXPO_PUBLIC_BASE_API_URL_WS ||
  BASE_API_URL.replace(/^http/, "ws");

/**
 * =========================
 * Backend nodes
 * =========================
 */
const DEFAULT_BACKEND_NODES: string[] = [BASE_API_URL];

const ADMIN_BACKEND_NODES: string[] = process.env.EXPO_PUBLIC_ADMIN_API_URLS
  ? JSON.parse(process.env.EXPO_PUBLIC_ADMIN_API_URLS)
  : DEFAULT_BACKEND_NODES;

export const getBackendNodes = () => ADMIN_BACKEND_NODES;

export const getBackendUrl = async (): Promise<string> => {
  const useCustom = (await AsyncStorage.getItem("use_custom_backend")) === "true";
  if (useCustom) {
    const customUrl = await AsyncStorage.getItem("custom_backend_url");
    if (customUrl) return customUrl.trim();
  }
  return DEFAULT_BACKEND_NODES[0];
};

export const isUsingCustomBackend = async (): Promise<boolean> =>
  (await AsyncStorage.getItem("use_custom_backend")) === "true";

export const getCustomBackendUrl = async (): Promise<string> =>
  (await AsyncStorage.getItem("custom_backend_url")) || "";

export const setCustomBackend = async (url?: string, enabled: boolean = true) => {
  if (enabled && url) {
    await AsyncStorage.multiSet([
      ["custom_backend_url", url.trim()],
      ["use_custom_backend", "true"],
    ]);
  } else {
    await AsyncStorage.multiRemove(["custom_backend_url", "use_custom_backend"]);
  }
};

/**
 * =========================
 * Initialize / refresh API URLs
 * =========================
 */
export const initializeApiUrl = async () => {
  try {
    const newUrl = await getBackendUrl();
    if (newUrl) {
      BASE_API_URL = newUrl;
      if (newUrl.startsWith("https://")) BASE_WS_API_URL = newUrl.replace("https://", "wss://");
      else if (newUrl.startsWith("http://")) BASE_WS_API_URL = newUrl.replace("http://", "ws://");
      else BASE_WS_API_URL = newUrl;
    }
  } catch (error) {
    console.warn("Failed to initialize API URL:", error);
  }
};

// auto refresh 30s
initializeApiUrl();
setInterval(initializeApiUrl, 30000);

/**
 * =========================
 * Helper functions
 * =========================
 */
const createApiUrlString = (path: string) => `${BASE_API_URL}${path}`;
const createDbApiUrlString = (path: string) => `${process.env.EXPO_PUBLIC_BASE_API_URL_DB || ""}${path}`;
const createWsUrlString = (path: string) => `${BASE_WS_API_URL}${path}`;

/**
 * =========================
 * Dynamic URL
 * =========================
 */
class DynamicUrl {
  constructor(private urlGetter: () => string) { }
  toString() { return this.urlGetter(); }
  valueOf() { return this.urlGetter(); }
}

/**
 * =========================
 * API_URL Export
 * =========================
 */
const LOCKET_URL = "/locket";
const LOCKET_PRO = "/locketpro";
const SUBSCRIPTION = "/subscription";

export const API_URL = {
  // Core
  CHECK_SERVER: new DynamicUrl(() => createApiUrlString("/keepalive")),
  LOGIN_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/login`)),
  LOGOUT_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/logout`)),
  CHECK_AUTH_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/checkauth`)),
  GET_INFO_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/getinfo`)),
  REFRESH_TOKEN_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/refresh-token`)),
  LOGIN_URL_V2: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/refresh-token`)), // Alias for refresh
  UPLOAD_MEDIA_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/upload-media`)),

  GET_LIST_FRIENDS_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/get-allfriends`)),
  SEND_CHAT_MESSAGE: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/sendChatMessageV2`)),

  GET_USER: "https://api.locketcamera.com/fetchUserV2",

  // Moments
  SEND_REACTION_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/reactMomentV3`)),
  INFO_REACTION_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/reactinfoMomentV3`)),
  GET_MOMENTV2_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/getPost`)),
  GET_LATEST_MOMENT: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/getLatestMomentV2`)),

  // Rollcall
  ROLLCALL_POSTS: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/getRollcallPosts`)),
  ROLLCALL_REACTION: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/postRollcallReaction`)),
  ROLLCALL_COMMENT: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/postRollcallComment`)),
  ROLLCALL_LIKE_COMMENT: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/likeRollcallComment`)),
  DELETE_ROLLCALL: new DynamicUrl(() => createApiUrlString(`${LOCKET_URL}/deleteRollcallPost`)),

  // WebSocket
  GET_All_MESSAGE: new DynamicUrl(() => createWsUrlString(`${LOCKET_URL}/getAllMessageV2`)),
  SEND_CHAT_MESSAGE_REACTION: new DynamicUrl(() => createWsUrlString(`${LOCKET_URL}/sendChatMessageReaction`)),

  // Pro
  GET_LASTEST_URL: new DynamicUrl(() => createApiUrlString(`${LOCKET_PRO}/getmoment`)),
  GET_CAPTION_THEMES: createDbApiUrlString(`${LOCKET_PRO}/themes`),
  GET_TIMELINE: createDbApiUrlString(`${LOCKET_PRO}/timelines`),
  DONATE_URL: createDbApiUrlString(`${LOCKET_PRO}/donations`),
  NOTIFI_URL: createDbApiUrlString(`${LOCKET_PRO}/notification`),

  // Subscription
  REGISTER_USER_PLANS: createDbApiUrlString(`${SUBSCRIPTION}/user-plans/register`),
  GET_USER_PLANS: createDbApiUrlString(`${SUBSCRIPTION}/user-plans`),
  GET_USER_SUBSCRIPTION: (userId: string) => createDbApiUrlString(`${SUBSCRIPTION}/user-plans/${userId}`),
};
