// ==========================================
// FILE: components/ActionControls.tsx
// ==========================================
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { MediaControls } from "./MediaControls";
import { MediaCapture } from "./MediaCapture";

const { width: deviceWidth } = Dimensions.get("window");

interface ActionControlsProps {
  hasMedia: boolean;
  onCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFlipCamera: () => void;
  onOpenGallery: () => void;
  onSend: () => void;
  onCancel: () => void;
  onCustomAction: () => void;
  isRecording: boolean;
  isSending?: boolean;
  mode: "picture" | "video";
  onModeChange: (mode: "picture" | "video") => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  hasMedia,
  onCapture,
  onStartRecording,
  onStopRecording,
  onFlipCamera,
  onOpenGallery,
  onSend,
  onCancel,
  onCustomAction,
  isRecording,
  isSending = false,
  mode,
  onModeChange,
}) => {
  // Animated styles for smooth transitions
  const controlsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(hasMedia ? 1 : 0, {
        duration: 200,
        easing: Easing.ease,
      }),
      transform: [
        {
          scale: withTiming(hasMedia ? 1 : 0.95, {
            duration: 200,
            easing: Easing.ease,
          }),
        },
      ],
    };
  });

  const captureAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(!hasMedia ? 1 : 0, {
        duration: 200,
        easing: Easing.ease,
      }),
      transform: [
        {
          scale: withTiming(!hasMedia ? 1 : 0.95, {
            duration: 200,
            easing: Easing.ease,
          }),
        },
      ],
    };
  });

  return (
    <View style={actionStyles.container}>
      {/* Media Controls - Hiển thị khi đã có media */}
      <Animated.View
        style={[
          actionStyles.controlsWrapper,
          controlsAnimatedStyle,
          { pointerEvents: hasMedia ? "auto" : "none" }
        ]}
      >
        <MediaControls
          onSend={onSend}
          onCancel={onCancel}
          onCustomAction={onCustomAction}
          isSending={isSending}
        />
      </Animated.View>

      {/* Media Capture - Hiển thị khi chưa có media */}
      <Animated.View
        style={[
          actionStyles.controlsWrapper,
          captureAnimatedStyle,
          { pointerEvents: !hasMedia ? "auto" : "none" }
        ]}
      >
        <MediaCapture
          onCapture={onCapture}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          onFlipCamera={onFlipCamera}
          onOpenGallery={onOpenGallery}
          isRecording={isRecording}
          mode={mode}
          onModeChange={onModeChange}
        />
      </Animated.View>
    </View>
  );
};

const actionStyles = StyleSheet.create({
  container: {
    width: deviceWidth,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  controlsWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});