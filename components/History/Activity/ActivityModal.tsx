import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/hooks/api";
import { Friend } from "@/hooks/services/friendsService";
import { useTheme } from "@/context/ThemeContext";

interface ActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    momentId: string | undefined;
    friendDetails: Friend[];
    user: any;
}

const formatTime = (time: string | null) => {
    if (!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    });
};

const ActivityModal: React.FC<ActivityModalProps> = ({
    isOpen,
    onClose,
    momentId,
    friendDetails,
    user,
}) => {
    const [activityData, setActivityData] = useState<{ reactions: any[]; views: any[] }>({
        reactions: [],
        views: [],
    });
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();

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
            console.error("Error mapping friends in ActivityModal:", e);
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
            if (!momentId || !isOpen) return;
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
                console.error("Error fetching activity data in ActivityModal:", error?.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchActivityData();
    }, [isOpen, momentId]);

    const combinedUsers = useMemo(() => {
        const { reactions, views } = activityData;
        const reactionIds = reactions.map((r) => r.user);

        const all = views.map((v) => ({
            userId: v.user,
            reacted: reactionIds.includes(v.user),
            emoji: reactions.find((r) => r.user === v.user)?.emoji || null,
            viewedAt: v.viewedAt || null,
            reactedAt: reactions.find((r) => r.user === v.user)?.createdAt || null,
        }));

        reactions.forEach((r) => {
            if (!all.find((u) => u.userId === r.user)) {
                all.push({
                    userId: r.user,
                    reacted: true,
                    emoji: r.emoji,
                    viewedAt: null,
                    reactedAt: r.createdAt,
                });
            }
        });

        return all.sort((a, b) => {
            if (a.reacted && !b.reacted) return -1;
            if (!a.reacted && b.reacted) return 1;
            const timeA = new Date(a.reactedAt || a.viewedAt || 0).getTime();
            const timeB = new Date(b.reactedAt || b.viewedAt || 0).getTime();
            return timeB - timeA;
        });
    }, [activityData]);

    if (!isOpen) return null;

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={[styles.content, { backgroundColor: colors["base-100"] }]}>
                    <View style={[styles.header, { borderBottomColor: colors["base-300"] }]}>
                        <Text style={[styles.title, { color: colors["base-content"] }]}>Hoạt động</Text>
                        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors["base-200"] }]}>
                            <Feather name="x" size={20} color={colors["base-content"]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.list}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color={colors.primary} size="large" />
                            </View>
                        ) : combinedUsers.length > 0 ? (
                            combinedUsers.map((u, i) => {
                                const info = resolveUserInfo(u.userId);
                                return (
                                    <View key={i} style={styles.item}>
                                        <Image
                                            source={{ uri: info.avatar }}
                                            style={[styles.avatar, { borderColor: colors["base-300"] }]}
                                        />
                                        <View style={styles.itemText}>
                                            <Text style={[styles.userName, { color: colors["base-content"] }]}>{info.name}</Text>
                                            <Text style={[styles.userAction, { color: colors["base-content"], opacity: 0.6 }]}>
                                                {u.reacted
                                                    ? `Đã thả reaction ${u.emoji} • ${formatTime(u.reactedAt)}`
                                                    : `Đã xem • ${formatTime(u.viewedAt)}`}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: colors["base-content"], opacity: 0.5 }]}>
                                    Chưa có ai xem hoặc thả cảm xúc
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: "60%",
        width: "100%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    list: {
        padding: 16,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
    },
    itemText: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: "600",
    },
    userAction: {
        fontSize: 13,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 15,
        textAlign: "center",
    },
});

export default ActivityModal;
