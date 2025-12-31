import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";
import Feather from "@expo/vector-icons/Feather";

export default function HomeHeader({
  goToPage,
}: {
  goToPage: (pageIndex: string) => void;
}) {
  return (
    <SafeAreaView edges={["top"]} style={headerStyles.container}>
      <View style={headerStyles.left}>
        <Pressable style={headerStyles.btnAvatar} onPress={() => goToPage("profile")}>
          <Image
            source={require("@/assets/images/default-profile.png")}
            style={headerStyles.avatar}
          />
        </Pressable>
      </View>
      <View style={headerStyles.center}>
        <View style={headerStyles.titleRow}>
          <FontAwesome6 name="user-group" size={16} color="white" />
          <ThemedText type="title" style={headerStyles.title}>
            {"NAN"}
          </ThemedText>
          <ThemedText type="title" style={headerStyles.title}>
            người bạn
          </ThemedText>
        </View>
      </View>
      <View style={headerStyles.right}>
        <Pressable style={headerStyles.btnMess} onPress={() => goToPage("messages")}>
          <Feather name="message-circle" size={30} color="white" />
        </Pressable>
      </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.22)", // nền nhẹ
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
    backgroundColor: "rgba(255, 255, 255, 0.22)",
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
    borderWidth: 4, // độ dày viền
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  title: { fontSize: 15, fontWeight: "600", color: "white" },
  buttonText: { color: "#007AFF", fontSize: 16 },
});
