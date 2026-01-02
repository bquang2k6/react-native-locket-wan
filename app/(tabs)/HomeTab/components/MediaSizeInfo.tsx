// ==========================================
// FILE: components/MediaSizeInfo.tsx
// ==========================================
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MediaSizeInfoProps {
  previewType: "image" | "video" | null;
  sizeInMB: number | null;
  maxImageSize: number;
  maxVideoSize: number;
}

export const MediaSizeInfo: React.FC<MediaSizeInfoProps> = ({
  previewType,
  sizeInMB,
  maxImageSize,
  maxVideoSize,
}) => {
  if (!previewType || sizeInMB === null) {
    return null;
  }

  const isImage = previewType === "image";
  const maxSize = isImage ? maxImageSize : maxVideoSize;
  const isTooBig = sizeInMB > maxSize;

  return (
    <View style={styles.container}>
      <View style={[styles.infoBox, isTooBig ? styles.errorBox : styles.successBox]}>
        <Text style={[styles.text, isTooBig ? styles.errorText : styles.successText]}>
          Dung lượng {isImage ? "ảnh" : "video"} là{" "}
          <Text style={styles.sizeText}>{sizeInMB} MB</Text>
        </Text>
        <Ionicons
          name={isTooBig ? "close-circle" : "checkmark-circle"}
          size={20}
          color={isTooBig ? "#ef4444" : "#22c55e"}
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  successBox: {
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  text: {
    fontSize: 14,
  },
  successText: {
    color: "#22c55e",
  },
  errorText: {
    color: "#ef4444",
  },
  sizeText: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default MediaSizeInfo;
