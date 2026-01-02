import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from "react-native-reanimated";

// Hardcoded for now based on matching the upload URL domain
const STREAK_URL = "https://apilocketwan.traidep.site/locket/getLatestMomentV2";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StreakProps {
    refresh?: number;
}

export default function Streak({ refresh }: StreakProps) {
    const [streakCount, setStreakCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isOutdated, setIsOutdated] = useState(false);

    // Animation values
    const glowOpacity = useSharedValue(0.6);
    const flickerOpacity1 = useSharedValue(0.9);
    const flickerOpacity2 = useSharedValue(0.8);

    useEffect(() => {
        // Start animations
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 1000 }),
                withTiming(0.6, { duration: 1000 })
            ),
            -1,
            true
        );

        flickerOpacity1.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        flickerOpacity2.value = withRepeat(
            withSequence(
                withTiming(0.9, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.6, { duration: 1300, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        const fetchStreak = async () => {
            try {
                const token = await AsyncStorage.getItem("idToken");
                const localId = await AsyncStorage.getItem("localId"); // Sometimes needed for body, checking ref

                if (!token) {
                    console.warn("⚠️ Thiếu token đăng nhập");
                    setLoading(false);
                    return;
                }

                const res = await axios.post(
                    STREAK_URL,
                    {
                        data: {
                            excluded_users: [],
                            fetch_streak: true,
                            should_count_missed_moments: true,
                        },
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const streak = res?.data?.result?.streak;

                if (streak && typeof streak.count === "number") {
                    setStreakCount(streak.count);

                    const today = new Date()
                        .toISOString()
                        .slice(0, 10)
                        .replace(/-/g, "");
                    const lastUpdated = String(streak.last_updated_yyyymmdd);

                    setIsOutdated(lastUpdated !== today);
                } else {
                    console.warn("Không tìm thấy streak trong response:", res.data);
                }
            } catch (err) {
                console.error("❌ Lỗi khi fetch streak:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStreak();
    }, [refresh]);

    // Colors
    const colors = isOutdated
        ? {
            from: "#9CA3AF", // gray-400
            via: "#6B7280", // gray-500
            to: "#4B5563", // gray-600
            text: "#F3F4F6", // gray-100
            stroke: "#374151",
        }
        : {
            from: "#d8b4fe", // purple-300
            via: "#a855f7", // purple-500
            to: "#9333ea", // purple-600
            text: "#FFFFFF",
            stroke: "#a855f7",
        };

    // Animated properties
    const glowOuterProps = useAnimatedProps(() => ({
        opacity: glowOpacity.value * 0.6
    }));

    const glowInnerProps = useAnimatedProps(() => ({
        opacity: glowOpacity.value * 0.8
    }));

    const flicker1Props = useAnimatedProps(() => ({
        opacity: flickerOpacity1.value
    }));

    const flicker2Props = useAnimatedProps(() => ({
        opacity: flickerOpacity2.value
    }));

    return (
        <View style={styles.container}>
            <View style={styles.flameContainer}>
                {/* SVG Flame */}
                <Svg height="80" width="80" viewBox="0 0 100 100" style={styles.svg}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="1" x2="0" y2="0">
                            <Stop offset="0" stopColor={colors.from} stopOpacity="1" />
                            <Stop offset="0.5" stopColor={colors.via} stopOpacity="1" />
                            <Stop offset="1" stopColor={colors.to} stopOpacity="1" />
                        </LinearGradient>
                        <LinearGradient id="gradOutdated" x1="0" y1="1" x2="0" y2="0">
                            <Stop offset="0" stopColor={colors.from} stopOpacity="1" />
                            <Stop offset="0.5" stopColor={colors.via} stopOpacity="1" />
                            <Stop offset="1" stopColor={colors.to} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>

                    {/* Outer Glow */}
                    <AnimatedCircle
                        cx="50"
                        cy="50"
                        r="40"
                        fill={`url(#${isOutdated ? "gradOutdated" : "grad"})`}
                        animatedProps={glowOuterProps}
                    />
                    <AnimatedCircle
                        cx="50"
                        cy="50"
                        r="32" // Smaller inner glow
                        fill={`url(#${isOutdated ? "gradOutdated" : "grad"})`}
                        animatedProps={glowInnerProps}
                    />

                    {/* Main Flame Body (Polygon converted to Path) */}
                    <AnimatedPath
                        d="M50 15 Q 80 40 85 70 Q 80 95 50 95 Q 20 95 15 70 Q 20 40 50 15 Z"
                        fill={`url(#${isOutdated ? "gradOutdated" : "grad"})`}
                        animatedProps={flicker1Props}
                    />

                    {/* Inner Flame Core (Reverse Flicker) */}
                    <AnimatedPath
                        d="M50 25 Q 65 40 70 60 Q 60 85 50 90 Q 40 85 30 60 Q 35 40 50 25 Z"
                        fill="white"
                        fillOpacity="0.4"
                        animatedProps={flicker2Props}
                    />

                </Svg>

                {/* Streak Count Text */}
                <View style={styles.textContainer}>
                    <Text style={[styles.streakText, { color: colors.text }]}>
                        {loading ? "..." : streakCount}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    flameContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        position: 'relative'
    },
    svg: {
        position: 'absolute',
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    streakText: {
        fontSize: 20,
        fontWeight: "900",
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
