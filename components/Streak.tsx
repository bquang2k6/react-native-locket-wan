import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Defs, LinearGradient, Stop, Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

const STREAK_URL = "https://apilocketwan.traidep.site/locket/getLatestMomentV2";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedView = Animated.createAnimatedComponent(View);

interface Props {
  refresh?: number;
}

export default function Streak({ refresh }: Props) {
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOutdated, setIsOutdated] = useState(false);

  // flicker animation
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity1 = useSharedValue(0.9);
  const opacity2 = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 600 }),
        withTiming(0.98, { duration: 600 })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );

    opacity1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.8, { duration: 800 })
      ),
      -1,
      true
    );

    opacity2.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700 }),
        withTiming(0.6, { duration: 700 })
      ),
      -1,
      true
    );

    const fetchStreak = async () => {
      try {
        const token = await AsyncStorage.getItem("idToken");
        if (!token) return;

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
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const streak = res?.data?.result?.streak;
        if (streak?.count !== undefined) {
          setStreakCount(streak.count);

          const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          setIsOutdated(String(streak.last_updated_yyyymmdd) !== today);
        }
      } catch {}
      finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [refresh]);

  const colors = isOutdated
    ? { from: "#9CA3AF", via: "#6B7280", to: "#4B5563", text: "#F3F4F6" }
    : { from: "#d8b4fe", via: "#a855f7", to: "#9333ea", text: "#FFFFFF" };

  const flickerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const outerProps = useAnimatedProps(() => ({ opacity: opacity1.value }));
  const innerProps = useAnimatedProps(() => ({ opacity: opacity2.value }));

  return (
    <View style={styles.container}>
      <AnimatedView style={[styles.flameWrapper, flickerStyle]}>
        <Svg width={45} height={45} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={colors.from} />
              <Stop offset="0.5" stopColor={colors.via} />
              <Stop offset="1" stopColor={colors.to} />
            </LinearGradient>
          </Defs>

          {/* Outer flame */}
          <AnimatedPath
            animatedProps={outerProps}
            d="M50 5 L75 30 L95 55 L75 80 L50 95 L25 80 L5 55 L25 30 Z"
            fill="url(#grad)"
          />

          {/* Inner flame */}
          <AnimatedPath
            animatedProps={innerProps}
            d="M50 15 L65 35 L75 55 L60 75 L50 90 L40 75 L25 55 L35 35 Z"
            fill="white"
            fillOpacity="0.4"
          />
        </Svg>
      </AnimatedView>

      <Text style={[styles.text, { color: colors.text }]}>
        {loading ? "..." : streakCount}
      </Text>
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
  flameWrapper: {
    position: "absolute",
  },
  text: {
    fontSize: 17,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 10,
  },
});
