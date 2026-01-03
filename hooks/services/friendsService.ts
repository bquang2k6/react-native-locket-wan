import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/hooks/api";

export interface Friend {
    uid: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profilePic?: string;
    profilePicture?: string;
}

export const fetchFriends = async (forceRefresh: boolean = false): Promise<Friend[]> => {
    try {
        const idToken = await AsyncStorage.getItem("idToken");
        const userStr = await AsyncStorage.getItem("user");

        if (!idToken) throw new Error("No idToken found");

        let localId = "";
        if (userStr) {
            const user = JSON.parse(userStr);
            localId = user.localId || user.uid || "";
        }

        // 1. Check cache first if not forcing refresh
        if (!forceRefresh) {
            const cachedFriends = await AsyncStorage.getItem("cached_friends");
            if (cachedFriends) {
                console.log("Returning cached friends list");
                return JSON.parse(cachedFriends);
            }
        }

        const res = await axios.post(
            API_URL.GET_LIST_FRIENDS_URL.toString(),
            {
                idToken,
                localId
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
            }
        );

        // Standardize response: some APIs return { data: [...] }, some { friends: [...] }, some just [...]
        const friendsList = res?.data?.friends || res?.data?.data || (Array.isArray(res?.data) ? res?.data : []);

        if (!Array.isArray(friendsList)) return [];

        // If the friends list only contains UIDs (typical for get-allfriends), we might need to fetch details
        // However, if the API is returning full objects, we should use them.
        // Let's check if the first item has details.
        const firstFriend = friendsList[0];
        const needsDetails = firstFriend && !firstFriend.firstName && !firstFriend.first_name;

        let finalFriends: Friend[] = [];

        if (needsDetails) {
            console.log("Friend list only contains UIDs, fetching details...");
            const detailedFriends = await Promise.allSettled(
                friendsList.slice(0, 50).map(f => fetchUser(f.uid || f))
            );

            finalFriends = detailedFriends
                .filter(r => r.status === "fulfilled" && r.value !== null)
                .map(r => (r as PromiseFulfilledResult<Friend>).value);
        } else {
            finalFriends = friendsList.map(f => ({
                uid: f.uid || f.id || f,
                username: f.username || "",
                firstName: f.firstName || f.first_name || "",
                lastName: f.lastName || f.last_name || "",
                profilePic: f.profilePic || f.profile_picture_url || f.profilePic || "",
                profilePicture: f.profilePicture || f.profile_picture_url || f.profilePic || ""
            }));
        }

        // 2. Save to cache
        if (finalFriends.length > 0) {
            await AsyncStorage.setItem("cached_friends", JSON.stringify(finalFriends));
            console.log("Friend list cached successfully");
        }

        return finalFriends;
    } catch (error: any) {
        console.error("Fetch friends failed:", error?.response?.data || error.message);
        return [];
    }
};

export const fetchUser = async (userUid: string): Promise<Friend | null> => {
    try {
        const idToken = await AsyncStorage.getItem("idToken");
        if (!idToken) return null;

        const res = await axios.post(
            API_URL.GET_USER.toString(),
            {
                data: {
                    user_uid: userUid,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = res?.data?.result?.data;
        if (!data) return null;

        return {
            uid: data.uid,
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            username: data.username || "",
            profilePic: data.profile_picture_url || "",
            profilePicture: data.profile_picture_url || "",
        };
    } catch (error) {
        // Silent error for batch fetching
        return null;
    }
};
