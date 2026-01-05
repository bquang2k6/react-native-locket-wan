// ==========================================
// FILE: components/MediaCapture.tsx
// ==========================================
import React from "react";
import { View, Pressable, StyleSheet, Dimensions } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface MediaCaptureProps {
  onCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFlipCamera: () => void;
  onOpenGallery: () => void;
  isRecording: boolean;
}

import { useTheme } from "@/context/ThemeContext";

export const MediaCapture: React.FC<MediaCaptureProps> = ({
  onCapture,
  onStartRecording,
  onStopRecording,
  onFlipCamera,
  onOpenGallery,
  isRecording,
}) => {
  const { colors } = useTheme();

  return (
    <View style={captureStyles.buttonRow}>
      {/* Nút mở thư viện */}
      <Pressable
        style={captureStyles.buttonArea}
        onPress={onOpenGallery}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      >
        <View style={captureStyles.actionButton}>
          <FontAwesome name="photo" size={28} color={colors["base-content"]} />
        </View>
      </Pressable>

      {/* Nút chụp ảnh / quay video */}
      <Pressable
        style={captureStyles.buttonArea}
        onPress={onCapture}
        onLongPress={onStartRecording}
        onPressOut={onStopRecording}
        delayLongPress={500}
        android_ripple={{ color: "rgba(255,255,255,0.3)" }}
      >
        <View style={[
          captureStyles.captureButton,
          { backgroundColor: colors["base-content"], borderColor: colors["base-100"] },
          isRecording && captureStyles.recordingButton
        ]}>
          {isRecording && <View style={captureStyles.recordingDot} />}
        </View>
      </Pressable>

      {/* Nút đổi camera */}
      <Pressable
        style={captureStyles.buttonArea}
        onPress={onFlipCamera}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
      >
        <View style={captureStyles.actionButton}>
          <MaterialIcons name="flip-camera-ios" size={30} color={colors["base-content"]} />
        </View>
      </Pressable>
    </View>
  );
};

const captureStyles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    width: width,
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
    width: 78,
    height: 78,
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
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButton: {
    borderColor: "#ff3b30",
    borderWidth: 5,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ff3b30",
  },
});

