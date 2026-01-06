// ==========================================
// FILE: components/MediaCapture.tsx
// ==========================================
import React from "react";
import { View, Pressable, StyleSheet, Dimensions } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

interface MediaCaptureProps {
  onCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFlipCamera: () => void;
  onOpenGallery: () => void;
  isRecording: boolean;
  mode: "picture" | "video";
  onModeChange: (mode: "picture" | "video") => void;
}

export const MediaCapture: React.FC<MediaCaptureProps> = ({
  onCapture,
  onStartRecording,
  onStopRecording,
  onFlipCamera,
  onOpenGallery,
  isRecording,
  mode,
  onModeChange,
}) => {
  const { colors } = useTheme();

  return (
    <View style={captureStyles.container}>
      {/* Nút chuyển đổi chế độ */}
      <View style={captureStyles.modeToggleContainer}>
        <Pressable
          style={[
            captureStyles.modeButton,
            mode === "picture" && { backgroundColor: "rgba(255,255,255,0.2)" }
          ]}
          onPress={() => onModeChange("picture")}
        >
          <MaterialIcons
            name="camera-alt"
            size={20}
            color={mode === "picture" ? colors["base-content"] : "gray"}
          />
        </Pressable>
        <Pressable
          style={[
            captureStyles.modeButton,
            mode === "video" && { backgroundColor: "rgba(255,255,255,0.2)" }
          ]}
          onPress={() => onModeChange("video")}
        >
          <MaterialIcons
            name="videocam"
            size={20}
            color={mode === "video" ? colors["base-content"] : "gray"}
          />
        </Pressable>
      </View>

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
          onPress={isRecording ? undefined : (mode === "picture" ? onCapture : undefined)}
          onLongPress={mode === "video" ? onStartRecording : undefined}
          onPressOut={mode === "video" ? onStopRecording : undefined}
          delayLongPress={500}
          android_ripple={{ color: "rgba(255,255,255,0.3)" }}
        >
          <View style={captureStyles.captureWrapper}>
            {/* Vòng ngoài */}
            <View
              style={[
                captureStyles.outerRing,
                isRecording && captureStyles.outerRingRecording,
                { backgroundColor: colors["base-300"], borderColor: colors["neutral"] },
              ]}
            />

            {/* Nút chính */}
            <View
              style={[
                captureStyles.captureButton,
                { backgroundColor: colors["base-content"], borderColor: colors["base-content"] },
                isRecording && captureStyles.recordingButton,
              ]}
            >
              {isRecording && <View />}
            </View>
          </View>
        </Pressable >

        {/* Nút đổi camera */}
        <Pressable
          style={captureStyles.buttonArea}
          onPress={onFlipCamera}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <View style={captureStyles.actionButton}>
            <MaterialIcons name="flip-camera-ios" size={30} color={colors["base-content"]} />
          </View>
        </Pressable >
      </View >
    </View>
  );
};

const captureStyles = StyleSheet.create({
  container: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingBottom: 10,
  },
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 4,
    marginBottom: 10,
    gap: 10,
  },
  modeButton: {
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 15,
  },
  buttonRow: {
    flexDirection: "row",
    width: width,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  buttonArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
  },
  captureButton: {
    width: 77,
    height: 77,
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
  captureWrapper: {
    width: 77,
    height: 77,
    justifyContent: "center",
    alignItems: "center",
  },
  outerRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
  },
  outerRingRecording: {
    borderColor: "#ffff", // fixed to 4 chars for white or use colors
    opacity: 0.8,
    transform: [{ scale: 1.1 }],
  },
});
