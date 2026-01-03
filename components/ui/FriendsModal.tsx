import React, { useState, useEffect, useMemo } from "react";
import {
    Modal,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Pressable,
    Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Search, RotateCcw, X, UserPlus, Trash2, Plus } from "lucide-react-native";
import { fetchFriends, Friend } from "@/hooks/services/friendsService";
import { ThemedText } from "@/components/themed-text";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FriendsModalProps {
    isVisible: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

export default function FriendsModal({ isVisible, onClose, onRefresh }: FriendsModalProps) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadFriends = async (force: boolean = false) => {
        setLoading(true);
        try {
            const data = await fetchFriends(force);
            setFriends(data);
        } catch (error) {
            console.error("Load friends error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            loadFriends();
        }
    }, [isVisible]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadFriends(true); // Force refresh
        setIsRefreshing(false);
        if (onRefresh) onRefresh();
    };

    const filteredFriends = useMemo(() => {
        return friends.filter((friend) => {
            const fullName = `${friend.firstName || ""} ${friend.lastName || ""}`.toLowerCase();
            const username = (friend.username || "").toLowerCase();
            const term = searchTerm.toLowerCase();
            return fullName.includes(term) || username.includes(term);
        });
    }, [friends, searchTerm]);

    const renderFriendItem = ({ item }: { item: Friend }) => (
        <View style={styles.friendItem}>
            <View style={styles.friendInfo}>
                <Image
                    source={
                        item.profilePic || item.profilePicture
                            ? { uri: item.profilePic || item.profilePicture }
                            : require("@/assets/images/default-profile.png")
                    }
                    style={styles.avatar}
                />
                <View>
                    <ThemedText style={styles.friendName}>
                        {item.firstName} {item.lastName}
                    </ThemedText>
                    <ThemedText style={styles.username}>@{item.username}</ThemedText>
                </View>
            </View>
        </View>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.dismissArea} onPress={onClose} />
                <View style={styles.content}>
                    <View style={styles.dragHandle} />

                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.title}>
                            ❤️‍🔥 {friends.length} người bạn
                        </ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X color="white" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Search color="#999" size={20} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm bạn bè..."
                            placeholderTextColor="#999"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.refreshBtn}
                        onPress={handleRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <RotateCcw color="white" size={16} />
                        )}
                        <ThemedText style={styles.refreshText}>
                            {isRefreshing ? "Đang làm mới..." : "Làm mới"}
                        </ThemedText>
                    </TouchableOpacity>

                    <FlatList
                        data={filteredFriends}
                        keyExtractor={(item) => item.uid}
                        renderItem={renderFriendItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            !loading && (
                                <View style={styles.emptyContainer}>
                                    <ThemedText style={styles.emptyText}>
                                        Không có bạn bè nào để hiển thị
                                    </ThemedText>
                                </View>
                            )
                        }
                    />

                    <View style={styles.fabContainer}>
                        <TouchableOpacity style={styles.fab}>
                            <Plus color="white" size={30} strokeWidth={3} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    dismissArea: {
        flex: 1,
    },
    content: {
        backgroundColor: "#1a1a1a",
        height: SCREEN_HEIGHT * 0.86,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: "#333",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 15,
    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        position: "relative",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
    },
    closeBtn: {
        position: "absolute",
        right: 0,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: "white",
        fontSize: 16,
    },
    refreshBtn: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        gap: 8,
    },
    refreshText: {
        fontSize: 14,
        color: "white",
    },
    listContent: {
        paddingBottom: 100,
    },
    friendItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#333",
    },
    friendInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#f59e0b",
    },
    friendName: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
    username: {
        fontSize: 14,
        color: "#999",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 50,
    },
    emptyText: {
        color: "#666",
        fontSize: 16,
    },
    fabContainer: {
        position: "absolute",
        bottom: 30,
        right: 20,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 12,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#f59e0b",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
