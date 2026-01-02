import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Interfaces
interface PostOverlay {
  type: string;
  icon?: string | number;
  caption?: string;
  color_top?: string;
  color_bottom?: string;
  text_color?: string;
}

interface AutoResizeCaptionProps {
  postOverlay: PostOverlay;
  setPostOverlay: (overlay: PostOverlay | ((prev: PostOverlay) => PostOverlay)) => void;
}

// Helper function để tính màu tương phản
const getContrastTextColor = (backgroundColor?: string): string => {
  if (!backgroundColor) return "#FFFFFF";

  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#000000" : "#FFFFFF";
};

// Star Rating Component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={20}
          color={star <= rating ? "#FFD700" : "#666"}
        />
      ))}
    </View>
  );
};

// Weather Icon Component (simplified - customize based on your needs)
const WeatherIcon: React.FC<{ weatherCode: string }> = ({ weatherCode }) => {
  const getWeatherIcon = (code: string) => {
    // Map weather codes to Ionicons
    const iconMap: { [key: string]: string } = {
      "01d": "sunny",
      "01n": "moon",
      "02d": "partly-sunny",
      "02n": "cloudy-night",
      "03d": "cloud",
      "03n": "cloud",
      "04d": "cloudy",
      "04n": "cloudy",
      "09d": "rainy",
      "09n": "rainy",
      "10d": "rainy",
      "10n": "rainy",
      "11d": "thunderstorm",
      "11n": "thunderstorm",
      "13d": "snow",
      "13n": "snow",
      "50d": "water",
      "50n": "water",
    };
    return iconMap[code] || "sunny";
  };

  return (
    <Ionicons
      name={getWeatherIcon(weatherCode) as any}
      size={24}
      color="white"
    />
  );
};

// Main Component
const AutoResizeCaption: React.FC<AutoResizeCaptionProps> = ({
  postOverlay,
  setPostOverlay,
}) => {
  const textInputRef = useRef<TextInput>(null);
  const [containerWidth, setContainerWidth] = useState(200);
  const placeholder = "Nhập tin nhắn...";
  const defaultImageIconWidth = 200;

  // Get text color
  const getTextColor = (): string => {
    if (postOverlay.text_color) return postOverlay.text_color;
    const bgColor = postOverlay.color_top || "#000000";
    return getContrastTextColor(bgColor);
  };

  // Get gradient colors
  const getGradientColors = (): [string, string] => {
    return [
      postOverlay.color_top || "#000000",
      postOverlay.color_bottom || postOverlay.color_top || "#000000",
    ];
  };

  // Handle text change
  const handleChange = (text: string) => {
    if (postOverlay.type === "weather") {
      setPostOverlay((prev) => ({
        ...prev,
        caption: text,
      }));
    } else {
      const icon = postOverlay.icon || "";
      const prefix = icon ? `${icon} ` : "";

      if (text.startsWith(prefix)) {
        const newCaption = text.slice(prefix.length);
        setPostOverlay((prev) => ({
          ...prev,
          caption: newCaption,
        }));
      } else {
        setPostOverlay((prev) => ({
          ...prev,
          caption: text,
        }));
      }
    }
  };

  // Calculate width based on text length
  useEffect(() => {
    const textLength = (postOverlay.caption || placeholder).length;
    const estimatedWidth = Math.min(
      Math.max(textLength * 10 + 80, defaultImageIconWidth),
      SCREEN_WIDTH * 0.9
    );
    setContainerWidth(estimatedWidth);
  }, [postOverlay.caption]);

  // Check if editable
  const isEditable = !["decorative", "custom"].includes(postOverlay?.type || "");

  // Format time
  const formattedTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Render based on type
  const renderContent = () => {
    const gradientColors = getGradientColors();
    const textColor = getTextColor();

    switch (postOverlay.type) {
      case "image_icon":
        return (
          <LinearGradient
            colors={gradientColors}
            style={[styles.container, { width: containerWidth }]}
          >
            {typeof postOverlay.icon === "string" && (
              <Image
                source={{ uri: postOverlay.icon }}
                style={styles.iconImage}
              />
            )}
            <TextInput
              ref={textInputRef}
              value={postOverlay.caption || ""}
              onChangeText={(text) =>
                setPostOverlay((prev) => ({ ...prev, caption: text }))
              }
              placeholder={placeholder}
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.textInput, { color: textColor, flex: 1 }]}
              multiline
            />
          </LinearGradient>
        );

      case "image_gif":
        return (
          <LinearGradient
            colors={gradientColors}
            style={[styles.container, { width: containerWidth }]}
          >
            {typeof postOverlay.icon === "string" && (
              <Image
                source={{ uri: postOverlay.icon }}
                style={styles.gifImage}
              />
            )}
            <Text
              style={[
                styles.captionText,
                { color: postOverlay.text_color || "#fff", flex: 1 },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {postOverlay.caption || ""}
            </Text>
          </LinearGradient>
        );

      case "time":
        return (
          <LinearGradient colors={gradientColors} style={styles.container}>
            <Ionicons name="time-outline" size={24} color={textColor} />
            <Text style={[styles.captionText, { color: textColor }]}>
              {postOverlay.caption || formattedTime}
            </Text>
          </LinearGradient>
        );

      case "weather":
        return (
          <LinearGradient colors={gradientColors} style={styles.container}>
            <WeatherIcon weatherCode={postOverlay.icon as string || "01d"} />
            <Text style={[styles.captionText, { color: textColor }]}>
              {postOverlay.caption || "25°C trời đẹp"}
            </Text>
          </LinearGradient>
        );

      case "review":
        return (
          <LinearGradient
            colors={gradientColors}
            style={[styles.reviewContainer, { maxWidth: SCREEN_WIDTH * 0.9 }]}
          >
            {/* Star Rating */}
            <View style={styles.starRow}>
              <StarRating rating={Number(postOverlay.icon) || 0} />
            </View>

            {/* Quote text */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteMarkLeft}>"</Text>
              <Text
                style={[
                  styles.quoteText,
                  { color: textColor },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {postOverlay.caption}
              </Text>
              <Text style={styles.quoteMarkRight}>"</Text>
            </View>
          </LinearGradient>
        );

      default:
        // Default textarea
        const displayValue =
          postOverlay.type === "weather"
            ? postOverlay.caption || "25°C trời đẹp"
            : postOverlay.icon
            ? `${postOverlay.icon} ${postOverlay.caption || ""}`.trim()
            : postOverlay.caption || "";

        return (
          <LinearGradient
            colors={gradientColors}
            style={[styles.container, { width: containerWidth }]}
          >
            <TextInput
              ref={textInputRef}
              value={displayValue}
              onChangeText={handleChange}
              placeholder={placeholder}
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[styles.textInput, { color: textColor }]}
              editable={isEditable}
              multiline
            />
          </LinearGradient>
        );
    }
  };

  return (
    <View style={styles.wrapper}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 32,
    minWidth: 200,
  },
  reviewContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    borderRadius: 32,
    alignItems: "center",
  },
  textInput: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    minHeight: 24,
    padding: 0,
    textAlignVertical: "center",
  },
  captionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  iconImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  gifImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  starContainer: {
    flexDirection: "row",
    gap: 4,
  },
  starRow: {
    marginBottom: 4,
  },
  quoteContainer: {
    position: "relative",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  quoteMarkLeft: {
    position: "absolute",
    top: -8,
    left: 0,
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  quoteMarkRight: {
    position: "absolute",
    top: -8,
    right: 0,
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  quoteText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "100%",
  },
});

export default AutoResizeCaption;