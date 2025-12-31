import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  FontAwesome,
  MaterialIcons,
  Entypo,
  Octicons,
} from "@expo/vector-icons";
import Svg, { Path, Defs, ClipPath, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ProfileScreenProps {
  goToPage: (pageKey: string) => void;
}

// Component BorderProgress với hiệu ứng chạy xung quanh viền
const BorderProgress = ({ isRecording, duration = 10000 }) => {
  const strokeDashoffset = useSharedValue(400);

  useEffect(() => {
    if (isRecording) {
      strokeDashoffset.value = 400;
      strokeDashoffset.value = withTiming(0, {
        duration: duration,
        easing: Easing.linear,
      });
    } else {
      strokeDashoffset.value = 400;
    }
  }, [isRecording, duration]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  if (!isRecording) return null;

  return (
    <Svg
      style={styles.svgBorder}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <Defs>
        <ClipPath id="roundedClip">
          <Rect x="0" y="0" width="100" height="100" rx="15" ry="15" />
        </ClipPath>
      </Defs>

      
      {/* Border chạy xung quanh */}
      <AnimatedPath
        clipPath="url(#roundedClip)"
        d="M15,0 H85 A15,15 0 0 1 100,15 V85 A15,15 0 0 1 85,100 H15 A15,15 0 0 1 0,85 V15 A15,15 0 0 1 15,0 Z"
        stroke="#00ccff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="butt"
        strokeDasharray="400"
        animatedProps={animatedProps}
      />
    </Svg>
  );
};

export default function MainHomeTab({ goToPage }: ProfileScreenProps) {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const isStoppingRef = useRef(false);

  const MAX_VIDEO_DURATION = 10000; // 10 giây

  // Hàm bắt đầu quay video
  const startRecording = async () => {
    if (!cameraRef.current || isRecording || isStoppingRef.current) return;

    console.log("🎥 Bắt đầu quay video...");
    setIsRecording(true);
    isStoppingRef.current = false;
    recordStartTimeRef.current = Date.now();

    try {
      // Bắt đầu quay video
      const recordPromise = cameraRef.current.recordAsync({
        maxDuration: MAX_VIDEO_DURATION / 1000,
        quality: "1080p",
        mute: true,
      });

      // Kiểm tra thời gian và tự động dừng
      recordTimerRef.current = setInterval(() => {
        if (isStoppingRef.current) return;

        const elapsed = Date.now() - recordStartTimeRef.current;

        // Tự động dừng khi hết thời gian
        if (elapsed >= MAX_VIDEO_DURATION) {
          stopRecording();
        }
      }, 100);

      // Đợi video hoàn thành
      const video = await recordPromise;

      if (video?.uri && !isStoppingRef.current) {
        console.log("✅ Video đã được quay:", video.uri);
        setPhotoUri(video.uri);
      }
    } catch (error: any) {
      // Chỉ log lỗi thực sự, không log khi user chủ động dừng
      if (!isStoppingRef.current && error?.message !== "Recording stopped") {
        console.error("❌ Lỗi khi quay video:", error);
        Alert.alert("Lỗi", "Không thể quay video. Vui lòng thử lại.");
      }
    } finally {
      // Cleanup
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setIsRecording(false);
      isStoppingRef.current = false;
    }
  };

  // Hàm dừng quay video
  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording || isStoppingRef.current) return;

    console.log("⏹️ Dừng quay video...");
    isStoppingRef.current = true;

    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.warn("⚠️ Lỗi khi dừng recording:", error);
    }
  };

  // Kiểm tra quyền camera
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            Ứng dụng cần quyền truy cập camera để chụp ảnh
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Cấp quyền Camera</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleFlipCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: true,
        base64: false,
        shutterSound: false,
        mirror: facing === "front",
      });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
      }
    } catch (error) {
      console.error("Lỗi khi chụp ảnh:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleOpenGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Lỗi khi mở thư viện:", error);
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh");
    }
  };

  const handleCancelPhoto = () => {
    setPhotoUri(null);
  };

  const handleSendPhoto = () => {
    if (photoUri) {
      Alert.alert("Gửi ảnh", `Đang gửi: ${photoUri.split("/").pop()}`, [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi",
          onPress: () => {
            console.log("Gửi media:", photoUri);
            setPhotoUri(null);
          },
        },
      ]);
    }
  };

  const handleCustomAction = () => {
    Alert.alert("Tùy chỉnh", "Chức năng chỉnh sửa", [
      { text: "Hủy", style: "cancel" },
      { text: "Chỉnh sửa", onPress: () => console.log("Mở editor") },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Camera hoặc ảnh/video đã chụp */}
      <View style={styles.cameraContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.cameraBox} />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.cameraBox}
            facing={facing}
            mirror={facing === "front"}
            autofocus="on"
          />
        )}

        {/* Border progress chạy xung quanh khi đang quay */}
        <BorderProgress 
          isRecording={isRecording} 
          duration={MAX_VIDEO_DURATION} 
        />

        {/* Overlay loading khi đang chụp */}
        {isCapturing && (
          <View style={styles.capturingOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.capturingText}>Đang chụp...</Text>
          </View>
        )}
      </View>

      {/* Nút điều khiển */}
      <View style={styles.buttonRow}>
        {photoUri ? (
          // Chế độ xem media đã chụp
          <>
            <Pressable
              style={styles.buttonArea}
              onPress={handleCancelPhoto}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <View style={styles.actionButton}>
                <Entypo name="cross" size={30} color="white" />
              </View>
            </Pressable>

            <Pressable
              style={styles.buttonArea}
              onPress={handleSendPhoto}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <View style={[styles.captureButton, styles.sendButton]}>
                <MaterialIcons
                  name="send"
                  size={28}
                  color="white"
                  style={{ transform: [{ rotate: "-20deg" }] }}
                />
              </View>
            </Pressable>

            <Pressable
              style={styles.buttonArea}
              onPress={handleCustomAction}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <View style={styles.actionButton}>
                <FontAwesome name="edit" size={24} color="white" />
              </View>
            </Pressable>
          </>
        ) : (
          // Chế độ chụp ảnh/quay video
          <>
            <Pressable
              style={styles.buttonArea}
              onPress={handleOpenGallery}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <View style={styles.actionButton}>
                <FontAwesome name="photo" size={28} color="white" />
              </View>
            </Pressable>

            <Pressable
              style={styles.buttonArea}
              onPress={handleTakePhoto}
              onLongPress={startRecording}
              onPressOut={stopRecording}
              delayLongPress={500}
              android_ripple={{ color: "rgba(255,255,255,0.3)" }}
            >
              <View
                style={[
                  styles.captureButton,
                  isRecording && styles.recordingButton,
                ]}
              >
                {isRecording && <View style={styles.recordingDot} />}
              </View>
            </Pressable>

            <Pressable
              style={styles.buttonArea}
              onPress={handleFlipCamera}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <View style={styles.actionButton}>
                <MaterialIcons name="flip-camera-ios" size={30} color="white" />
              </View>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.historyButtonContainer}>
        <Pressable style={styles.historyButton} onPress={() => goToPage("history")}>
          <Text style={styles.historyText}>Lịch sử</Text>
          <Octicons name="chevron-down" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    position: "relative",
  },
  cameraBox: {
    width: width,
    aspectRatio: 1,
    borderRadius: 64,
    overflow: "hidden",
    backgroundColor: "black",
  },
  svgBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 50,
  },
  permissionBox: {
    width: width * 0.8,
    padding: 24,
    borderRadius: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    color: "white",
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  capturingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 64,
    zIndex: 40,
  },
  capturingText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: "row",
    width: width,
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 8,
    height: 140,
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
    backgroundColor: "#cececeff",
    borderColor: "#ffffffff",
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  // recordingButton: {
  //   borderColor: "#ffffffff",
  //   borderWidth: 5,
  // },
  // recordingDot: {
  //   width: 16,
  //   height: 16,
  //   borderRadius: 8,
  //   backgroundColor: "#ff3b30",
  // },
  historyButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -50,
  },
  historyButton: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  historyText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});