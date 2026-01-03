import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/hooks/api";

export interface RollcallPost {
    uid: string;
    user: string;
    created_at: {
        _seconds: number;
    };
    items: RollcallItem[];
    comments?: RollcallComment[];
}

export interface RollcallItem {
    uid: string;
    main_url: string;
    video_url?: string;
    metadata?: {
        width?: number;
        height?: number;
    };
    reactions?: Array<{
        user: string;
        reaction: string;
    }>;
}

export interface RollcallComment {
    uid: string;
    body: string;
    user: string;
    post_item_uid: string;
    likes: string[];
    created_at: {
        _seconds: number;
    };
}

/**
 * Fetch rollcall posts for a specific week
 * @param weekOfYear - Week number (1-52)
 * @param year - Year (e.g., 2025)
 * @returns Array of rollcall posts
 */
export async function fetchRollcallPosts(
    weekOfYear: number,
    year: number
): Promise<RollcallPost[]> {
    try {
        const token = await AsyncStorage.getItem("idToken");
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await axios.post(
            API_URL.ROLLCALL_POSTS.toString(),
            { data: { week_of_year: weekOfYear, year } },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data?.result?.data?.posts) {
            return response.data.result.data.posts;
        }

        return [];
    } catch (error) {
        console.error("Error fetching rollcall posts:", error);
        throw error;
    }
}

/**
 * Post a comment on a rollcall post
 * @param postUid - UID of the post
 * @param postItemUid - UID of the specific post item
 * @param body - Comment text
 * @param postUserUid - UID of the user posting the comment
 */
export async function postRollcallComment(
    postUid: string,
    postItemUid: string,
    body: string,
    postUserUid: string
): Promise<void> {
    try {
        const token = await AsyncStorage.getItem("idToken");
        if (!token) {
            throw new Error("No authentication token found");
        }

        await axios.post(
            API_URL.ROLLCALL_COMMENT.toString(),
            {
                data: {
                    body,
                    post_item_uid: postItemUid,
                    post_uid: postUid,
                    post_user_uid: postUserUid,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error("Error posting rollcall comment:", error);
        throw error;
    }
}

/**
 * Post a reaction to a rollcall item
 * @param postItemUid - UID of the post item
 * @param reaction - Reaction emoji/text
 */
export async function postRollcallReaction(
    postItemUid: string,
    reaction: string
): Promise<void> {
    try {
        const token = await AsyncStorage.getItem("idToken");
        if (!token) {
            throw new Error("No authentication token found");
        }

        await axios.post(
            API_URL.ROLLCALL_REACTION.toString(),
            {
                data: {
                    post_item_uid: postItemUid,
                    reaction,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error("Error posting rollcall reaction:", error);
        throw error;
    }
}
