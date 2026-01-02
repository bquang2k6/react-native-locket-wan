// ==========================================
// FILE: components/MediaControls.tsx
// ==========================================
import React from "react";
import { View, Pressable, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const SparklesIcon = () => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={30}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    color="white"
  >
    <Path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <Path d="M20 3v4" />
    <Path d="M22 5h-4" />
    <Path d="M4 17v2" />
    <Path d="M5 18H3" />
  </Svg>
);


const { width: screenWidth } = Dimensions.get("window");

interface MediaControlsProps {
  onSend: () => void;
  onCancel: () => void;
  onCustomAction: () => void;
  isSending?: boolean;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  onSend,
  onCancel,
  onCustomAction,
  isSending = false,
}) => {
  return (
    <View style={controlsStyles.buttonRow}>
      {/* Nút hủy */}
      <Pressable
        style={controlsStyles.buttonArea}
        onPress={onCancel}
        disabled={isSending}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      >
        <View style={controlsStyles.actionButton}>
          <Entypo name="cross" size={30} color="white" />
        </View>
      </Pressable>

      {/* Nút gửi */}
      <Pressable
        style={controlsStyles.buttonArea}
        onPress={onSend}
        disabled={isSending}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      >
        <View style={[controlsStyles.captureButton, controlsStyles.sendButton]}>
          {isSending ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <MaterialIcons
              name="send"
              size={28}
              color="white"
              style={{ transform: [{ rotate: "-20deg" }] }}
            />
          )}
        </View>
      </Pressable>

      {/* Nút tùy chỉnh */}
      <Pressable
        style={controlsStyles.buttonArea}
        onPress={onCustomAction}
        disabled={isSending}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      >
        <View style={controlsStyles.actionButton}>
          <SparklesIcon />
        </View>
      </Pressable>
    </View>
  );
};

const controlsStyles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    width: screenWidth,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    height: "100%",
  },
  buttonArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sendButton: {
    backgroundColor: "#cecece",
    borderColor: "#ffffff",
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});

