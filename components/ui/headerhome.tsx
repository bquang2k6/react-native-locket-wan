import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";
import AntDesign from '@expo/vector-icons/AntDesign';
import { fetchFriends } from "@/hooks/services/friendsService";
import FriendsModal from "./FriendsModal";
import { Link } from 'expo-router';

import { useTheme } from "@/context/ThemeContext";

export default function HomeHeader({
  goToPage,
  hideFriendIndicator = false,
}: {
  goToPage: (pageIndex: string) => void;
  hideFriendIndicator?: boolean;
}) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("NAN");
  const [friendCount, setFriendCount] = useState<number>(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const { colors } = useTheme();

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);

      if (user?.profilePicture) {
        setAvatar(user.profilePicture);
      }

      if (user?.displayName) {
        setDisplayName(user.displayName);
      }
    } catch (err) {
      console.log("❌ Load user error:", err);
    }
  };

  const loadFriends = useCallback(async () => {
    try {
      const friends = await fetchFriends();
      setFriendCount(friends.length);
    } catch (err) {
      console.log("❌ Load friends error:", err);
    }
  }, []);

  useEffect(() => {
    loadUser();
    loadFriends();
  }, [loadFriends]);

  return (
    <SafeAreaView edges={["top"]} style={headerStyles.container}>
      <View style={headerStyles.left}>
        <Pressable
          style={headerStyles.btnAvatar}
          onPress={() => goToPage("profile")}
        >
          <Image
            source={
              avatar
                ? { uri: avatar }
                : require("@/assets/images/default-profile.png")
            }
            style={[headerStyles.avatar, { borderColor: colors["neutral"] }]}
          />
        </Pressable>
      </View>
      {!hideFriendIndicator && (
        <View style={headerStyles.center}>
          <Pressable
            style={[headerStyles.titleRow, { backgroundColor: colors["base-200"] }]}
            onPress={() => setModalVisible(true)}
          >
            <FontAwesome6 name="user-group" size={16} color={colors["base-content"]} />
            <ThemedText type="title" style={[headerStyles.title, { color: colors["base-content"] }]}>
              {friendCount} người bạn
            </ThemedText>
          </Pressable>
        </View>
      )}
      <View style={headerStyles.right}>
        <Link href="/listupload" asChild>
          <Pressable>
            <AntDesign name="ordered-list" size={30} color={colors["base-content"]} />
          </Pressable>
        </Link>
      </View>
      <FriendsModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onRefresh={loadFriends}
      />
    </SafeAreaView>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    position: "absolute", // cố định trên cùng
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10, // để luôn hiển thị trên các content khác
    backgroundColor: "transparent", // trong suốt, không che nội dung
    marginTop: 10,
  },
  left: {
    flex: 1,
    justifyContent: "flex-start",
  },
  center: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAvatar: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 100,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "rgba(255, 255, 255, 0.22)", // nền nhẹ -> moved to inline styles
    borderRadius: 24, // bo góc đẹp
    paddingHorizontal: 16, // khoảng cách trong
    paddingVertical: 6,
    gap: 4, // khoảng cách icon và text
  },
  btnMess: {
    alignItems: "center",
    justifyContent: "center",
    width: 45,
    height: 45,
    // backgroundColor: "rgba(255, 255, 255, 0.22)", -> moved to inline styles
    borderRadius: 100,
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 2, // độ dày viền
    // borderColor: "rgba(255, 255, 255, 0.22)", -> moved to inline styles
  },
  title: { fontSize: 15, fontWeight: "600" },
  buttonText: { color: "#007AFF", fontSize: 16 },
});
