import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import { API_URL } from "@/hooks/api";

export default function Timeline() {
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const router = useRouter();

    useEffect(() => {
        fetchTimeline();
    }, []);

    const fetchTimeline = async () => {
        setLoading(true);
        try {
            const cached = await AsyncStorage.getItem("timelineData");
            const cacheTime = await AsyncStorage.getItem("timelineCacheTime");

            const now = Date.now();
            const maxAge = 5 * 60 * 1000; // ⏱ 5 phút

            if (cached && cacheTime && now - parseInt(cacheTime) < maxAge) {
                const data = JSON.parse(cached);
                if (Array.isArray(data)) {
                    setTimelineData(data);
                    setLoading(false);
                    return;
                }
            }

            // Nếu không có cache hoặc đã cũ thì gọi API
            const res = await axios.get(API_URL.GET_TIMELINE);
            if (Array.isArray(res.data)) {
                setTimelineData(res.data);
                await AsyncStorage.setItem("timelineData", JSON.stringify(res.data));
                await AsyncStorage.setItem("timelineCacheTime", now.toString());
            } else {
                setTimelineData([]);
            }
        } catch (err) {
            console.error("Lỗi khi lấy timeline:", err);
            setError("Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchTimeline();
        setRefreshing(false);
    }, []);

    // Loading skeleton
    const renderLoadingSkeleton = () => (
        <View style={styles.content}>
            <Text style={[styles.title, { color: colors["base-content"] }]}>
                Lịch sử cập nhật
            </Text>
            {[...Array(7)].map((_, index) => (
                <View key={index} style={styles.timelineItem}>
                    {/* Timeline line */}
                    {index !== 0 && (
                        <View
                            style={[
                                styles.timelineLine,
                                styles.timelineLineTop,
                                { backgroundColor: colors["base-300"] },
                            ]}
                        />
                    )}

                    {/* Timeline dot */}
                    <View
                        style={[
                            styles.timelineDot,
                            { backgroundColor: colors["base-300"] },
                        ]}
                    />

                    {/* Timeline content skeleton */}
                    <View
                        style={[
                            styles.timelineContent,
                            index % 2 === 0 ? styles.contentLeft : styles.contentRight,
                        ]}
                    >
                        <View
                            style={[
                                styles.skeleton,
                                styles.skeletonDate,
                                { backgroundColor: colors["base-300"] },
                            ]}
                        />
                        <View
                            style={[
                                styles.skeleton,
                                styles.skeletonTitle,
                                { backgroundColor: colors["base-300"] },
                            ]}
                        />
                        <View
                            style={[
                                styles.skeleton,
                                styles.skeletonDescription,
                                { backgroundColor: colors["base-300"] },
                            ]}
                        />
                    </View>

                    {/* Bottom line */}
                    <View
                        style={[
                            styles.timelineLine,
                            styles.timelineLineBottom,
                            { backgroundColor: colors["base-300"] },
                        ]}
                    />
                </View>
            ))}
        </View>
    );

    // Error state
    if (error && !loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors["base-100"] }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors["base-content"]} />
                    </TouchableOpacity>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                    <TouchableOpacity
                        onPress={fetchTimeline}
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}
                    >
                        <Text style={[styles.retryButtonText, { color: colors["base-100"] }]}>
                            Thử lại
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Empty state
    if (!loading && !timelineData.length) {
        return (
            <View style={[styles.container, { backgroundColor: colors["base-100"] }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors["base-content"]} />
                    </TouchableOpacity>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={[styles.emptyText, { color: colors["base-content"] }]}>
                        Không có dữ liệu lịch sử.
                    </Text>
                </View>
            </View>
        );
    }

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

            {loading ? (
                renderLoadingSkeleton()
            ) : (
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors["base-content"] }]}>
                        Lịch sử cập nhật
                    </Text>

                    {/* Timeline */}
                    {timelineData.map((update, index) => (
                        <View key={update.id || index} style={styles.timelineItem}>
                            {/* Top line */}
                            {index !== 0 && (
                                <View
                                    style={[
                                        styles.timelineLine,
                                        styles.timelineLineTop,
                                        { backgroundColor: colors["base-300"] },
                                    ]}
                                />
                            )}

                            {/* Timeline dot with checkmark */}
                            <View
                                style={[
                                    styles.timelineDot,
                                    { backgroundColor: colors.success },
                                ]}
                            >
                                <Feather name="check" size={12} color={colors["base-100"]} />
                            </View>

                            {/* Timeline content */}
                            <View
                                style={[
                                    styles.timelineContent,
                                    index % 2 === 0 ? styles.contentLeft : styles.contentRight,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.date,
                                        { color: colors["base-content"] },
                                        index % 2 === 0 ? styles.textRight : styles.textLeft,
                                    ]}
                                >
                                    {update.date}
                                </Text>
                                <Text
                                    style={[
                                        styles.updateTitle,
                                        { color: colors["base-content"] },
                                        index % 2 === 0 ? styles.textRight : styles.textLeft,
                                    ]}
                                >
                                    {update.title}
                                </Text>
                                <Text
                                    style={[
                                        styles.description,
                                        { color: colors["base-content"] },
                                        index % 2 === 0 ? styles.textRight : styles.textLeft,
                                    ]}
                                >
                                    {update.description}
                                </Text>
                            </View>

                            {/* Bottom line */}
                            <View
                                style={[
                                    styles.timelineLine,
                                    styles.timelineLineBottom,
                                    { backgroundColor: colors["base-content"] },
                                ]}
                            />
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}

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
        paddingTop: 20,
        maxWidth: 640,
        width: "100%",
        alignSelf: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 32,
    },
    timelineItem: {
        position: "relative",
        paddingBottom: 40,
    },
    timelineLine: {
        position: "absolute",
        left: 12,
        width: 2,
        zIndex: 0,
    },
    timelineLineTop: {
        top: 0,
        height: 20,
    },
    timelineLineBottom: {
        top: 40,
        bottom: 0,
    },
    timelineDot: {
        position: "absolute",
        left: 7,
        top: 20,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    timelineContent: {
        marginLeft: 40,
        gap: 4,
    },
    contentLeft: {
        alignItems: "flex-start",
    },
    contentRight: {
        alignItems: "flex-end",
    },
    date: {
        fontSize: 14,
        fontFamily: "monospace",
        fontStyle: "italic",
    },
    updateTitle: {
        fontSize: 18,
        fontWeight: "800",
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    textLeft: {
        textAlign: "left",
    },
    textRight: {
        textAlign: "right",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    skeleton: {
        borderRadius: 4,
    },
    skeletonDate: {
        width: 96,
        height: 16,
    },
    skeletonTitle: {
        width: 160,
        height: 24,
        marginTop: 4,
    },
    skeletonDescription: {
        width: "100%",
        height: 16,
        marginTop: 4,
    },
    bottomSpacer: {
        height: 40,
    },
});