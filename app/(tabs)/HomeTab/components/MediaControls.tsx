// ==========================================
// FILE: components/MediaControls.tsx
// ==========================================
import React from "react";
import { View, Pressable, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";

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
          <FontAwesome name="edit" size={24} color="white" />
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

