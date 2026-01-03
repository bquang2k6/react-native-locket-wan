import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/hooks/api";

export interface MomentOverlay {
    text?: string;
    textColor?: string;
    background?: {
        colors: string[];
    };
    icon?: any;
    type?: string;
}

export interface ServerMoment {
    id: string;
    user: any;
    thumbnailUrl?: string;
    videoUrl?: string;
    date: string;
    createTime?: string;
    md5?: string;
    overlays?: MomentOverlay;
    caption?: string;
}

export interface TransformedMoment {
    _origin: "server";
    id: string;
    user: any;
    image_url: string | null;
    thumbnail_url: string | null;
    video_url: string | null;
    date: string;
    md5: string | null;
    captions: any[];
}

const transformServerMoment = (m: ServerMoment): TransformedMoment => {
    const overlay = m.overlays || null;
    const captionText = overlay?.text || m.caption || "";
    const captionItem = captionText
        ? {
            caption: captionText,
            text: captionText,
            text_color: overlay?.textColor || "#FFFFFFE6",
            background: { colors: overlay?.background ? (overlay.background.colors || []) : [] },
            icon: overlay?.icon || null,
            type: overlay?.type || "caption",
        }
        : null;

    return {
        _origin: "server",
        id: m.id,
        user: m.user,
        image_url: m.thumbnailUrl || null,
        thumbnail_url: m.thumbnailUrl || null,
        video_url: m.videoUrl || null,
        date: m.date || m.createTime || new Date().toISOString(),
        md5: m.md5 || null,
        captions: captionItem ? [captionItem] : [],
    };
};

export const fetchServerMoments = async (userId: string, pageToken: string | null = null, limit: number = 50) => {
    try {
        const idToken = await AsyncStorage.getItem("idToken");
        if (!idToken) throw new Error("No idToken found");

        const res = await axios.post(
            API_URL.GET_MOMENTV2_URL.toString(),
            {
                limit,
                pageToken,
                userId,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
            }
        );

        const data = res?.data?.moments || [];
        const nextToken = res?.data?.nextPageToken || null;
        const mapped = Array.isArray(data) ? data.map(transformServerMoment) : [];

        return {
            moments: mapped,
            nextPageToken: nextToken,
        };
    } catch (error: any) {
        console.error("Fetch server moments failed:", error?.response?.data || error.message);
        throw error;
    }
};

export const sendReaction = async (momentId: string, emoji: string) => {
    try {
        const idToken = await AsyncStorage.getItem("idToken");
        if (!idToken) throw new Error("No idToken found");

        const res = await axios.post(
            API_URL.SEND_REACTION_URL.toString(),
            {
                emoji: emoji,
                moment_id: momentId,
                intensity: 0,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
            }
        );

        return res.data;
    } catch (error: any) {
        console.error("Failed to send reaction:", error?.response?.data || error.message);
        throw error;
    }
};

export const deleteServerMoment = async (momentId: string, userId: string) => {
    try {
        const idToken = await AsyncStorage.getItem("idToken");
        if (!idToken) throw new Error("No idToken found");

        const res = await axios.post(
            API_URL.DELETE_MOMENT_V2.toString(),
            {
                data: {
                    moment_uid: momentId,
                    delete_globally: true,
                    owner_uid: userId,
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
            }
        );

        return res.data;
    } catch (error: any) {
        console.error("Delete failed:", error?.response?.data || error.message);
        throw error;
    }
};
