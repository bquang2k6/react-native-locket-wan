import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Octicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import Svg, { Path, Defs, ClipPath, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";


// Import components
import { ActionControls } from "./components/ActionControls";
import { MediaSizeInfo } from "./components/MediaSizeInfo";
import AutoResizeCaption from "./components/AutoResizeCaption";
import Streak from "../../../components/Streak";

import { uploadMedia } from "@/hooks/services/uploadMedia";

const { width } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);


interface MainHomeTabProps {
  goToPage: (pageKey: string) => void;
}












//upload
const buildMediaFile = (uri: string, type: "image" | "video") => {
  const fileExt = type === "image" ? "jpg" : "mp4";

  return {
    uri,
    name: `media_${Date.now()}.${fileExt}`,
    type: type === "image" ? "image/jpeg" : "video/mp4",
  } as any;
};





















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

export default function MainHomeTab({ goToPage }: MainHomeTabProps) {
  // Camera states
  const [facing, setFacing] = useState<CameraType>("front");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mediaSizeInMB, setMediaSizeInMB] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const isStoppingRef = useRef(false);
  const [postOverlay, setPostOverlay] = useState<string>("");


  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  // Đảm bảo không truyền tham số vào usePermissions để tránh xin quyền AUDIO không cần thiết
  // const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

  // User plan configuration (giả lập - thay bằng data thật của bạn)
  const userPlan = {
    max_image_size: 5, // MB
    max_video_size: 10, // MB
  };
  const MAX_VIDEO_DURATION_SEC = 10;
  const MAX_VIDEO_DURATION_MS = MAX_VIDEO_DURATION_SEC * 1000;

  const MAX_VIDEO_DURATION = 10000; // 10 giây
  // tính size ảnh/video
  const getFileSizeMB = async (uri: string): Promise<number> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists || !fileInfo.size) return 0;

      // bytes → MB
      return Number((fileInfo.size / (1024 * 1024)).toFixed(2));
    } catch (e) {
      console.warn("Không lấy được size file:", e);
      return 0;
    }
  };



  const [user, setUser] = useState<{
    idToken: string;
    localId: string;
  } | null>(null);











  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          console.log("👤 User loaded in MainHomeTab:", userData.localId);
        }

        const planStr = await AsyncStorage.getItem("userPlan");
        if (planStr) {
          console.log("💳 User plan loaded:", JSON.parse(planStr).plan_id);
        } else {
          console.log("💳 No user plan found, using default");
        }
      } catch (e) {
        console.error("Failed to load user data from AsyncStorage:", e);
      }
    };
    fetchUserData();
  }, []);

  // =============================================
  // VIDEO RECORDING FUNCTIONS
  // =============================================
  const startRecording = async () => {
    if (!cameraRef.current || isRecording || isStoppingRef.current) return;

    setIsRecording(true);
    isStoppingRef.current = false;

    try {
      const recordPromise = cameraRef.current.recordAsync({
        maxDuration: MAX_VIDEO_DURATION_SEC,
        mute: true,
      });

      // Backup stop
      recordTimerRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_VIDEO_DURATION_MS) as unknown as NodeJS.Timeout;

      const video = await recordPromise;

      if (video?.uri) {
        if (video.duration && video.duration * 1000 > MAX_VIDEO_DURATION_MS) {
          Alert.alert("Video quá dài", `Tối đa ${MAX_VIDEO_DURATION_SEC} giây`);
          return;
        }

        const sizeMB = await getFileSizeMB(video.uri);
        setPhotoUri(video.uri);
        setMediaType("video");
        setMediaSizeInMB(sizeMB);
      }

    } catch (e) {
      console.warn("Record error:", e);
    } finally {
      if (recordTimerRef.current) {
        clearTimeout(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setIsRecording(false);
      isStoppingRef.current = false;
    }
  };



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

  // =============================================
  // CAMERA FUNCTIONS
  // =============================================
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
        mirror: false,
      });

      if (photo?.uri) {
        const sizeMB = await getFileSizeMB(photo.uri);

        setPhotoUri(photo.uri);
        setMediaType("image");
        setMediaSizeInMB(sizeMB);
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
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (
          asset.type === "video" &&
          asset.duration &&
          asset.duration > MAX_VIDEO_DURATION_MS
        ) {
          Alert.alert(
            "Video quá dài",
            `Chỉ cho phép tối đa ${MAX_VIDEO_DURATION_SEC} giây`
          );
          return;
        }

        const sizeMB = await getFileSizeMB(asset.uri);

        setPhotoUri(asset.uri);
        setMediaType(asset.type === "video" ? "video" : "image");
        setMediaSizeInMB(sizeMB);
      }
    } catch (error) {
      console.error("Lỗi khi mở thư viện:", error);
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh");
    }
  };

  // =============================================
  // MEDIA CONTROL FUNCTIONS
  // =============================================


  const handleCancelPhoto = async () => {
    if (photoUri) {
      try {
        await FileSystem.deleteAsync(photoUri, { idempotent: true });
      } catch (e) {
        console.warn("Không xóa được file cache:", e);
      }
    }

    setPhotoUri(null);
    setMediaType(null);
    setMediaSizeInMB(null);
  };

  const handleSendPhoto = async () => {
    if (!photoUri || !mediaType) return;

    // 1. Check size theo plan
    const maxSize =
      mediaType === "image"
        ? userPlan.max_image_size
        : userPlan.max_video_size;

    if (mediaSizeInMB && mediaSizeInMB > maxSize) {
      Alert.alert(
        "Lỗi",
        `${mediaType === "image" ? "Ảnh" : "Video"} vượt quá ${maxSize}MB`
      );
      return;
    }

    setIsSending(true);

    try {
      // 2. Build file
      const file = buildMediaFile(photoUri, mediaType);

      // 3. Build payload
      const payload = {
        userData: {
          idToken: user.idToken,   // 👈 bạn lấy từ auth
          localId: user.localId,
        },
        mediaInfo: {
          type: mediaType,
          file,
        },
        options: {
          caption: postOverlay || "",
        },
      };

      // 4. Upload
      if (!user) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
        return;
      }

      const res = await uploadMedia({
        userData: {
          idToken: user.idToken,
          localId: user.localId,
        },
        mediaInfo: {
          type: mediaType,
          file,
        },
        options: {
          caption: postOverlay || "",
        },
      });

      console.log("✅ Upload OK:", res);

      Alert.alert("Thành công", "Đã đăng moment 🎉");
      handleCancelPhoto();
    } catch (err) {
      console.error("❌ Upload failed:", err);
      Alert.alert("Lỗi", "Upload thất bại, vui lòng thử lại");
    } finally {
      setIsSending(false);
    }
  };

  const handleCustomAction = () => {
    Alert.alert("Tùy chỉnh", "Chức năng chỉnh sửa", [
      { text: "Hủy", style: "cancel" },
      { text: "Chỉnh sửa", onPress: () => console.log("Mở editor") },
    ]);
  };

  // =============================================
  // PERMISSION CHECKS
  // =============================================
  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            Ứng dụng cần quyền Camera và Microphone
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={async () => {
              await requestCameraPermission();
              await requestMicPermission();
            }}
          >
            <Text style={styles.permissionButtonText}>Cấp quyền</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // =============================================
  // MAIN RENDER
  // =============================================
  return (
    <View style={styles.container}>

      {/* Camera hoặc ảnh/video đã chụp */}
      <View style={styles.cameraContainer}>
        {photoUri ? (
          mediaType === "video" ? (
            <Video
              source={{ uri: photoUri }}
              style={styles.cameraBox}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              isLooping={true}
            />
          ) : (
            <Image
              source={{ uri: photoUri }}
              style={[
                styles.cameraBox, facing === "front" && { transform: [{ scaleX: -1 }] },]} />
          )
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.cameraBox}
            facing={facing}
            mirror={facing === "front"}
            autofocus="on"
          />
        )}

        <BorderProgress isRecording={isRecording} duration={MAX_VIDEO_DURATION} />

        {isCapturing && (
          <View style={styles.capturingOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.capturingText}>Đang chụp...</Text>
          </View>
        )}
        {photoUri && (
          <AutoResizeCaption
            postOverlay={postOverlay}
            setPostOverlay={setPostOverlay}
          />
        )}
      </View>
      <Streak />

      {/* Media Size Info */}
      <MediaSizeInfo
        previewType={mediaType}
        sizeInMB={mediaSizeInMB}
        maxImageSize={userPlan.max_image_size}
        maxVideoSize={userPlan.max_video_size}
      />

      {/* Action Controls */}
      <ActionControls
        hasMedia={!!photoUri}
        onCapture={handleTakePhoto}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onFlipCamera={handleFlipCamera}
        onOpenGallery={handleOpenGallery}
        onSend={handleSendPhoto}
        onCancel={handleCancelPhoto}
        onCustomAction={handleCustomAction}
        isRecording={isRecording}
        isSending={isSending}
      />

      {/* History Button */}
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
  historyButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
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