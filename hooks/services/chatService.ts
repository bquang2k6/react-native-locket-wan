import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/hooks/api";
import { checkAndRefreshIdToken } from "../tokenManager";

const getAuth = async () => {
    try {
        const token = await checkAndRefreshIdToken();
        if (!token) {
            // Fallback
            return await AsyncStorage.getItem("idToken");
        }
        return token;
    } catch (err) {
        console.error("Error getting auth token:", err);
        return await AsyncStorage.getItem("idToken");
    }
};

export const GetAllMessage = async (timestamp = null) => {
    try {
        const token = await getAuth();
        if (!token) throw new Error("No token found");

        const url = String(API_URL.GET_All_MESSAGE);
        console.log("📨 Calling GetAllMessage API:", url);

        const res = await axios.post(
            url,
            { timestamp },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("📨 GetAllMessage response:", res.data);
        return res.data?.data;
    } catch (err) {
        console.warn("Failed to get all messages", err);
        return null;
    }
};

export const getMessagesWithUser = async (
    messageId: string, // uid of the user to get messages with
    timestamp = null
) => {
    try {
        const token = await getAuth();
        if (!token) throw new Error("No token found");

        const res = await axios.post(
            String(API_URL.GET_All_MESSAGE_WITH_USER),
            {
                messageId: messageId,
                timestamp,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data?.data;
    } catch (err) {
        console.warn("Failed to get messages with user", err);
        return null;
    }
};

export const sendMessage = async (messageInfo: {
    message: string;
    receiver_uid: string;
    moment_id?: string | null;
}) => {
    try {
        const token = await getAuth();
        if (!token) throw new Error("No token found");

        const body = {
            data: {
                msg: messageInfo.message || " ",
                moment_uid: messageInfo?.moment_id || null,
                receiver_uid: messageInfo.receiver_uid,
            },
        };

        const response = await axios.post(String(API_URL.SEND_CHAT_MESSAGE), body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (err) {
        console.error("sendMessage error:", err);
        throw err;
    }
};

export const markReadMessage = async (conversationId: string) => {
    try {
        const token = await getAuth();
        if (!token) throw new Error("No token found");

        const body = {
            data: {
                conversation_uid: conversationId,
            },
        };

        const response = await axios.post(String(API_URL.MARK_AS_READ), body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (err) {
        console.error("markReadMessage error:", err);
        throw err;
    }
};

export const sendReactionOnMessage = async (reactionData: {
    messageId: string;
    emoji: string;
    conversationId: string;
}) => {
    try {
        const token = await getAuth();
        if (!token) throw new Error("No token found");

        const body = {
            data: {
                message_id: reactionData.messageId,
                emoji: reactionData.emoji,
                conversation_id: reactionData.conversationId,
            },
        };

        const response = await axios.post(
            String(API_URL.SEND_CHAT_MESSAGE_REACTION),
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (err) {
        console.error("sendReactionOnMessage error:", err);
        throw err;
    }
};
