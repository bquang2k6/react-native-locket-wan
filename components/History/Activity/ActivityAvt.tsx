import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/hooks/api";
import { Friend } from "@/hooks/services/friendsService";

interface ActivityAvtProps {
    momentId: string | undefined;
    friendDetails: Friend[];
    user: any;
}

const ActivityAvt: React.FC<ActivityAvtProps> = ({ momentId, friendDetails, user }) => {
    const [activityData, setActivityData] = useState<{ reactions: any[]; views: any[] }>({ reactions: [], views: [] });
    const [loading, setLoading] = useState(false);

    const resolveUserInfo = useMemo(() => {
        const map = new Map();
        try {
            (friendDetails || []).forEach((f) => {
                const name = `${f.firstName || ""} ${f.lastName || ""}`.trim() || f.username || "Người dùng";
                const avatar = f.profilePic || f.profilePicture || "/prvlocket.png";
                if (f.uid) map.set(String(f.uid), { name, avatar });
                if (f.username) map.set(String(f.username), { name, avatar });
            });
        } catch (e) {
            console.error("Error mapping friends in ActivityAvt:", e);
        }

        if (user) {
            const selfName = user.displayName || user.username || user.email || "Bạn";
            const selfAvatar = user.profilePicture || user.photoURL || "/prvlocket.png";
            if (user.localId) map.set(String(user.localId), { name: selfName, avatar: selfAvatar });
            if (user.username) map.set(String(user.username), { name: selfName, avatar: selfAvatar });
        }

        return (identifier: string) =>
            map.get(String(identifier)) || { name: "Người dùng", avatar: "/prvlocket.png" };
    }, [friendDetails, user]);

    useEffect(() => {
        const fetchActivityData = async () => {
            if (!momentId) return;
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("idToken");
                if (!token) return;

                const res = await axios.post(
                    API_URL.INFO_REACTION_URL.toString(),
                    { idMoment: momentId },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data?.success) {
                    setActivityData({
                        reactions: res.data.data.reactions || [],
                        views: res.data.data.views || [],
                    });
                }
            } catch (error: any) {
                console.error("Error fetching activity data in ActivityAvt:", error?.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivityData();
    }, [momentId]);

    const combinedUsers = useMemo(() => {
        const { reactions, views } = activityData;
        const reactionIds = reactions.map((r) => r.user);

        const all = views.map((v) => ({
            userId: v.user,
            reacted: reactionIds.includes(v.user),
            viewedAt: v.viewedAt || null,
            reactedAt: reactions.find((r) => r.user === v.user)?.createdAt || null,
        }));

        reactions.forEach((r) => {
            if (!all.find((u) => u.userId === r.user)) {
                all.push({
                    userId: r.user,
                    reacted: true,
                    viewedAt: null,
                    reactedAt: r.createdAt,
                });
            }
        });

        return all
            .sort((a: any, b: any) => {
                if (a.reacted && !b.reacted) return -1;
                if (!a.reacted && b.reacted) return 1;
                const timeA = new Date(a.reactedAt || a.viewedAt || 0).getTime();
                const timeB = new Date(b.reactedAt || b.viewedAt || 0).getTime();
                return timeB - timeA;
            })
            .slice(0, 5); // Limit to top 5 for the avatar stack
    }, [activityData]);

    if (loading || combinedUsers.length === 0) return null;

    return (
        <View style={styles.container}>
            {combinedUsers.map((u, i) => {
                const info = resolveUserInfo(u.userId);
                return (
                    <Image
                        key={i}
                        source={{ uri: info.avatar }}
                        style={[
                            styles.avatar,
                            { marginLeft: i === 0 ? 0 : -10 }
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#fff",
        backgroundColor: "#eee",
    },
});

export default ActivityAvt;
