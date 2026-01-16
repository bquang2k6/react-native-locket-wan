import React, { useState, useMemo, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    TextInput,
    ScrollView,
    Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Stack from "./Stack";
import { useHeicImages } from "@/hooks/useHeicImages";
import formatTime from "@/utils/formatTime";
import { RollcallPost, RollcallComment } from "@/hooks/services/rollcallService";
import { fetchFriends, Friend } from "@/hooks/services/friendsService";
import { useTheme } from "@/context/ThemeContext";

const { width, height } = Dimensions.get("window");

interface PostCardProps {
    post: RollcallPost;
    onAddComment: (postUid: string, postItemUid: string, body: string) => void;
    friendDetails?: Friend[];
}

export default function PostCard({ post, onAddComment, friendDetails = [] }: PostCardProps) {
    const [user, setUser] = useState<any>(null);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState<RollcallComment[]>(post.comments || []);
    const { colors } = useTheme();

    useEffect(() => {
        const loadUser = async () => {
            const userStr = await AsyncStorage.getItem("user");
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        };
        loadUser();
    }, []);

    // Find user info for the post creator
    const userInfo = useMemo(() => {
        const friend = friendDetails?.find((f: any) => f.uid === post.user);
        return friend || {
            firstName: "User",
            lastName: "",
            profilePic: "https://via.placeholder.com/40",
        };
    }, [friendDetails, post.user]);

    // Extract image URLs from post items
    const rawImages = useMemo(
        () => post.items.map((item) => item.main_url),
        [post.items]
    );

    const { images, loading } = useHeicImages(rawImages);

    const firstItem = post.items[0];

    const handleAddComment = async () => {
        if (!newComment.trim() || !user?.uid) return;

        const tempComment: RollcallComment = {
            uid: Date.now().toString(),
            body: newComment,
            user: user.uid,
            post_item_uid: firstItem.uid,
            likes: [],
            created_at: { _seconds: Math.floor(Date.now() / 1000) },
        };

        setComments([...comments, tempComment]);
        setNewComment("");

        try {
            await onAddComment(post.uid, firstItem.uid, newComment);
        } catch (err) {
            console.error("Failed to send comment", err);
            // Rollback on error
            setComments(comments);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading images...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Image Stack */}
            <View
                style={[
                    styles.imageFrame,
                    {
                        width: Math.min(width * 0.8, firstItem.metadata?.width || width * 0.8),
                        height: Math.min(height * 0.8, firstItem.metadata?.height || height * 0.8),
                    },
                ]}
            >
                <Stack
                    randomRotation
                    sensitivity={50}
                    sendToBackOnClick
                    cards={images.map((src, i) => {
                        const item = post.items[i];
                        return (
                            <View key={i} style={styles.cardContent}>
                                <Image
                                    source={{ uri: src }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                                {item.reactions && item.reactions.length > 0 && (
                                    <View style={styles.reactionsContainer}>
                                        <Text style={styles.reactions}>
                                            {item.reactions.map((r) => r.reaction).join(" ")}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                />
            </View>

            {/* User Info */}
            <View style={styles.userInfoContainer}>
                <View style={styles.userInfo}>
                    <Image
                        source={{ uri: userInfo.profilePic }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={[styles.userName, { color: colors["base-content"] }]}>
                            {userInfo.firstName} {userInfo.lastName}
                        </Text>
                        <Text style={[styles.timestamp, { color: colors["base-content"] }]}>
                            {formatTime(post.created_at._seconds)}
                        </Text>
                    </View>
                </View>

                {/* Comment Button */}
                <TouchableOpacity
                    onPress={() => setShowComments(!showComments)}
                    style={styles.commentButton}
                >
                    <Feather name="message-circle" size={18} color={colors["base-content"]} />
                    <Text style={[styles.commentCount, { color: colors["base-content"] }]}>{comments.length}</Text>
                </TouchableOpacity>
            </View>

            {/* Comments Modal */}
            <Modal
                visible={showComments}
                transparent
                animationType="slide"
                onRequestClose={() => setShowComments(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowComments(false)}
                >
                    <View
                        style={[styles.modalContent, { backgroundColor: colors["base-100"] }]}
                        onStartShouldSetResponder={() => true}
                    >
                        <ScrollView style={styles.commentsScroll}>
                            {comments.map((comment) => {
                                const commenter = friendDetails?.find(
                                    (f: any) => f.uid === comment.user
                                ) || {
                                    firstName: "User",
                                    lastName: "",
                                    profilePic: "https://via.placeholder.com/30",
                                };

                                return (
                                    <View key={comment.uid} style={styles.commentItem}>
                                        <Image
                                            source={{ uri: commenter.profilePic }}
                                            style={styles.commentAvatar}
                                        />
                                        <View style={styles.commentBody}>
                                            <Text style={[styles.commentText, { color: colors["base-content"] }]}>
                                                <Text style={[styles.commenterName, { color: colors["base-content"] }]}>
                                                    {commenter.firstName} {commenter.lastName}
                                                </Text>
                                                : {comment.body}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>

                        {/* Add Comment */}
                        <View style={styles.addCommentContainer}>
                            <TextInput
                                style={[styles.commentInput, { color: colors["base-content"], borderColor: colors["base-300"] }]}
                                value={newComment}
                                onChangeText={setNewComment}
                                placeholder="Write a comment..."
                                placeholderTextColor={colors["base-content"] + "80"}
                            />
                            <TouchableOpacity
                                onPress={handleAddComment}
                                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                            >
                                <Text style={[styles.sendButtonText, { color: colors["base-100"] }]}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        gap: 16,
    },
    loadingContainer: {
        height: height * 0.8,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#fff",
        fontSize: 16,
    },
    imageFrame: {
        borderRadius: 16,
        // overflow: "hidden", // Removed to prevent clipping of rotated cards
    },
    cardContent: {
        width: "100%",
        height: "100%",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    reactionsContainer: {
        position: "absolute",
        bottom: 12,
        left: 8,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
    },
    reactions: {
        color: "#fff",
        fontSize: 20,
    },
    userInfoContainer: {
        width: width * 0.9,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    timestamp: {
        color: "#888",
        fontSize: 12,
    },
    commentButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    commentCount: {
        color: "#888",
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: height * 0.5,
        padding: 16,
    },
    commentsScroll: {
        flex: 1,
    },
    commentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 12,
    },
    commentAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    commentBody: {
        flex: 1,
    },
    commentText: {
        fontSize: 14,
        color: "#000",
    },
    commenterName: {
        fontWeight: "600",
    },
    addCommentContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 14,
        color: "#000",
    },
    sendButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
