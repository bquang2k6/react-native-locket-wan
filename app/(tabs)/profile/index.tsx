import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import { fetchFriends } from "@/hooks/services/friendsService";
import axios from "axios";

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const { colors } = useTheme();
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [userinfo, setUserinfo] = useState<any>({});
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const userStr = await AsyncStorage.getItem("user");
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                }
                await loadFriendsList();
            } catch (err) {
                console.error("❌ Lỗi load dữ liệu ban đầu:", err);
            }
        };

        loadInitialData();
    }, []);

    const loadFriendsList = async () => {
        try {
            const data = await fetchFriends();
            console.log("✅ Danh sách bạn bè:", data);
            setUserinfo((prev) => ({ ...prev, friends: data }));

            // Lưu vào AsyncStorage
            await AsyncStorage.setItem("friendsList", JSON.stringify(data));
        } catch (err) {
            console.error("❌ Lỗi lấy danh sách bạn bè:", err);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadFriendsList();
        setRefreshing(false);
    }, []);


    const formatDate = (timestamp) => {
        if (!timestamp) return "Không có dữ liệu";
        return new Date(parseInt(timestamp)).toLocaleDateString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
        });
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return "Không có dữ liệu";

        const date = new Date(parseInt(timestamp));
        const options = {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
            timeZone: "Asia/Ho_Chi_Minh",
        };

        return date.toLocaleString("vi-VN", options);
    };

    const formatDateTimeV2 = (timestamp) => {
        if (!timestamp) return "Không có dữ liệu";

        const date = new Date(timestamp);
        const options = {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
            timeZone: "Asia/Ho_Chi_Minh",
        };

        return date.toLocaleString("vi-VN", options);
    };

    const handleOpenProfile = () => {
        if (user?.username) {
            Linking.openURL(`https://locket.cam/${user.username}`);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors["base-100"] }]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors["base-content"]} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Welcome Text */}
                <Text style={[styles.welcomeText, { color: colors["base-content"] }]}>
                    Chào mừng, "<Text style={styles.welcomeName}>{user?.displayName}</Text>"
                    đến với tài khoản của bạn!
                </Text>

                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: colors["base-200"] }]}>
                    <View style={styles.profileHeader}>
                        {/* Avatar */}
                        <View style={styles.avatarContainer}>
                            {!imageLoaded && (
                                <View style={styles.avatarLoading}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                </View>
                            )}
                            <Image
                                source={{
                                    uri: user?.profilePicture || "https://via.placeholder.com/96",
                                }}
                                style={[
                                    styles.avatar,
                                    !imageLoaded && styles.avatarHidden,
                                ]}
                                onLoad={() => setImageLoaded(true)}
                            />
                        </View>

                        {/* User Info */}
                        <View style={styles.userInfo}>
                            <Text style={[styles.displayName, { color: colors["base-content"] }]}>
                                {user?.displayName}
                            </Text>
                            <Text style={[styles.email, { color: colors["base-content"] }]}>
                                {user?.email || "Không có email"}
                            </Text>
                            <TouchableOpacity onPress={handleOpenProfile}>
                                <Text style={[styles.profileLink, { color: colors.primary }]}>
                                    https://locket.cam/{user?.username}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Account Details Card */}
                <View style={[styles.detailsCard, { backgroundColor: colors["base-200"] }]}>
                    <Text style={[styles.detailsTitle, { color: colors["base-content"] }]}>
                        Thông tin tài khoản:
                    </Text>

                    <View style={[styles.detailsGrid, { backgroundColor: colors["base-300"] }]}>
                        <InfoRow
                            label="UID"
                            value={user?.localId}
                            colors={colors}
                        />
                        <InfoRow
                            label="Email"
                            value={user?.email}
                            colors={colors}
                        />
                        <InfoRow
                            label="Username"
                            value={user?.username}
                            colors={colors}
                        />
                        <InfoRow
                            label="Tên hiển thị"
                            value={user?.displayName}
                            colors={colors}
                        />
                        <InfoRow
                            label="Số điện thoại"
                            value={user?.phoneNumber}
                            colors={colors}
                        />
                        <InfoRow
                            label="Đăng nhập lần cuối"
                            value={formatDateTime(user?.lastLoginAt)}
                            colors={colors}
                        />
                        <InfoRow
                            label="Ngày tạo tài khoản"
                            value={formatDateTimeV2(user?.createdAt)}
                            colors={colors}
                        />
                        <InfoRow
                            label="Mật khẩu cập nhật lần cuối"
                            value={formatDate(user?.lastRefreshAt)}
                            colors={colors}
                        />
                        <InfoRow
                            label="Xác thực tùy chỉnh"
                            value={user?.customAuth ? "Có" : "Không"}
                            colors={colors}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}

// Component hiển thị từng dòng thông tin
const InfoRow = ({ label, value, colors }: { label: string; value: any; colors: any }) => (
    <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors["base-content"] }]}>
            {label}:
        </Text>
        <Text style={[styles.infoValue, { color: colors["base-content"] }]}>
            {value || "Không có dữ liệu"}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        alignItems: "center",
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 32,
    },
    welcomeName: {
        fontWeight: "800",
    },
    profileCard: {
        width: "100%",
        maxWidth: 640,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    avatarContainer: {
        position: "relative",
        width: 96,
        height: 96,
    },
    avatarLoading: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    avatarHidden: {
        opacity: 0,
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    displayName: {
        fontSize: 24,
        fontWeight: "600",
    },
    email: {
        fontSize: 16,
        fontWeight: "600",
    },
    profileLink: {
        fontSize: 14,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    detailsCard: {
        width: "100%",
        maxWidth: 640,
        borderRadius: 16,
        padding: 24,
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
    },
    detailsGrid: {
        borderRadius: 12,
        padding: 16,
        gap: 16,
    },
    infoRow: {
        gap: 4,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "800",
    },
    bottomSpacer: {
        height: 40,
    },
});