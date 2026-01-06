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
  cancelAnimation,
} from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import { Video as VideoCompressor } from "react-native-compressor";
import * as ImageManipulator from "expo-image-manipulator";
import ViewShot, { captureRef } from "react-native-view-shot";


// Import components
import { ActionControls } from "./components/ActionControls";
import { MediaSizeInfo } from "./components/MediaSizeInfo";
import AutoResizeCaption from "./components/AutoResizeCaption";
import Streak from "../../../components/Streak";
import { CustomStudioModal, PostOverlay } from "./components/CustomStudio/CustomStudioModal";

import { uploadMedia } from "@/hooks/services/uploadMedia";
import { UploadQueue } from "@/hooks/services/UploadQueue";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";

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
const BorderProgress = ({ isRecording, duration = 10000, hasMedia }: { isRecording: boolean; duration?: number; hasMedia: boolean }) => {
  const strokeDashoffset = useSharedValue(400);

  useEffect(() => {
    if (isRecording) {
      strokeDashoffset.value = 400;
      strokeDashoffset.value = withTiming(0, {
        duration: duration,
        easing: Easing.linear,
      });
    } else if (!hasMedia) {
      // Reset khi không có media
      strokeDashoffset.value = 400;
    } else {
      // Dừng (freeze) tại vị trí hiện tại khi ngừng quay nhưng có media (hoặc đang chờ finalize)
      cancelAnimation(strokeDashoffset);
    }
  }, [isRecording, duration, hasMedia]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  if (!isRecording && !hasMedia) return null;

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

import { useTheme } from "@/context/ThemeContext";

export default function MainHomeTab({ goToPage }: MainHomeTabProps) {
  // Camera states
  const [facing, setFacing] = useState<CameraType>("front");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mediaSizeInMB, setMediaSizeInMB] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const viewShotRef = useRef<View>(null);
  const [streakRefresh, setStreakRefresh] = useState(0);
  const { colors } = useTheme();

  const userStopTimeRef = useRef(null);
  const recordStartTimeRef = useRef(null);
  const [uiRecording, setUiRecording] = useState(false);
  const isStoppingRef = useRef(false);
  const [postOverlay, setPostOverlay] = useState<PostOverlay>({
    type: "default",
    caption: "",
  });
  const [captureMode, setCaptureMode] = useState<"picture" | "video">("picture");

  const handleModeChange = (newMode: "picture" | "video") => {
    console.log("🔄 Changing mode to:", newMode);
    if (photoUri) {
      handleCancelPhoto(); // Clear preview and delete file to free memory
    }
    setCaptureMode(newMode);
  };
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);


  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  // Đảm bảo không truyền tham số vào usePermissions để tránh xin quyền AUDIO không cần thiết
  // const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

  // User plan configuration (giả lập - thay bằng data thật của bạn)
  const userPlan = {
    max_image_size: 5, // MB
    max_video_size: 30, // MB
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
    if (!cameraRef.current) return;

    console.log("🎥 startRecording: Initiating...");

    recordStartTimeRef.current = Date.now();
    userStopTimeRef.current = null;
    // 🔥 UI chạy NGAY
    setUiRecording(true);
    try {
      const recordVideoPromise = cameraRef.current.recordAsync();

      // Chờ cho đến khi recording thực sự kết thúc (sau stopRecordingSafely)
      const video = await recordVideoPromise;

      if (video?.uri) {
        console.log("✅ video recorded:", video.uri);
        setPhotoUri(video.uri);
        setMediaType("video");
        setMediaSizeInMB(await getFileSizeMB(video.uri));
      }
    } catch (e) {
      console.log("record error", e);
    } finally {
      console.log("🎥 startRecording: cleanup");
      setUiRecording(false);
    }
  };
  const onUserRelease = () => {
    if (!recordStartTimeRef.current) return;

    console.log("⏹️ user released");

    userStopTimeRef.current = Date.now();

    // 🔥 DỪNG VIỀN NGAY LẬP TỨC
    setUiRecording(false);

    stopRecordingSafely(); // camera stop ngầm
  };
  const stopRecordingSafely = async () => {
    if (!cameraRef.current || isStoppingRef.current) return;

    isStoppingRef.current = true;

    const MIN_RECORD_MS = 2500;
    const elapsed = Date.now() - recordStartTimeRef.current;

    if (elapsed < MIN_RECORD_MS) {
      await new Promise(r => setTimeout(r, MIN_RECORD_MS - elapsed));
    }

    try {
      await cameraRef.current.stopRecording();
    } catch (e) {
      console.log("stop error", e);
    } finally {
      isStoppingRef.current = false;
      recordStartTimeRef.current = null;
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
      // Fast capture: low quality for speed, processing happens later
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
        skipProcessing: true, // 👈 Skip as much as possible for speed
      });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setMediaType("image");
        // Update size later or just set a placeholder
        setMediaSizeInMB(await getFileSizeMB(photo.uri));
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
    setPostOverlay({
      type: "default",
      caption: "",
    });
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

    if (!user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
      return;
    }

    setIsSending(true);
    try {
      let finalPhotoUri = photoUri;

      // Processing: Crop image/video to 1:1 ONLY when sending to keep UI fast
      if (mediaType === "image") {
        try {
          console.log("📸 Processing image (Crop to square)...");
          const photoInfo = await ImageManipulator.manipulateAsync(
            photoUri,
            [],
            { format: ImageManipulator.SaveFormat.JPEG }
          );

          const photoWidth = photoInfo.width!;
          const photoHeight = photoInfo.height!;
          const cropSize = Math.min(photoWidth, photoHeight);
          const originX = Math.floor((photoWidth - cropSize) / 2);
          const originY = Math.floor((photoHeight - cropSize) / 2);

          const cropped = await ImageManipulator.manipulateAsync(
            photoUri,
            [
              {
                crop: {
                  originX,
                  originY,
                  width: cropSize,
                  height: cropSize,
                },
              },
              { resize: { width: 1200, height: 1200 } },
            ],
            {
              compress: 0.8,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          finalPhotoUri = cropped.uri;
        } catch (e) {
          console.warn("Image processing failed:", e);
        }
      } else if (mediaType === "video") {
        try {
          console.log("🎥 Processing video (Crop to square)...");
          // Video compressor with center crop (simplified approach)
          const croppedVideoUri = await VideoCompressor.compress(
            photoUri,
            {
              compressionMethod: "auto",
            }
          );
          finalPhotoUri = croppedVideoUri;
        } catch (e) {
          console.warn("Video processing failed:", e);
        }
      }

      // 2. Build file
      const file = buildMediaFile(finalPhotoUri, mediaType);

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
          type: postOverlay.type || "background",
          overlay_id: postOverlay.overlay_id || "standard",
          icon: postOverlay.icon || "",
          text_color: postOverlay.text_color || "#FFFFFF",
          color_top: postOverlay.color_top || "",
          color_bottom: postOverlay.color_bottom || "",
          audience: "everyone",
          recipients: [],
          caption: postOverlay.caption || "",
        },
      };

      // Check Network
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        console.log("📴 Offline detected. Adding to queue...");
        const added = await UploadQueue.addToQueue(payload);
        if (added) {
          Alert.alert("Offline", "Đã lưu vào danh sách chờ tải lên. Sẽ tự động tải lên khi có mạng.");
          // Reset UI without deleting the file (since queue moved it or needs it)
          // addToQueue MOVES the file, so photoUri is now invalid/moved.
          // We can safely clear UI.
          setPhotoUri(null);
          setMediaType(null);
          setMediaSizeInMB(null);
          setPostOverlay({ type: "default", caption: "" });
        } else {
          Alert.alert("Lỗi", "Không thể lưu vào danh sách chờ.");
        }
        return;
      }

      // 4. Upload
      if (!user) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập lại");
        return;
      }

      const res = await uploadMedia(payload);

      console.log("✅ Upload OK:", res);
      setStreakRefresh(prev => prev + 1); // Refresh streak UI
      Alert.alert("Thành công", "Đã đăng moment 🎉");
      handleCancelPhoto();
    } catch (err) {
      console.error("❌ Upload failed:", err);
      Alert.alert("Lỗi", "Upload thất bại, vui lòng thử lại");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    // Process queue on mount in case there are pending items from last session
    UploadQueue.processQueue();

    // Listen for network changes to process queue
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        UploadQueue.processQueue();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCustomAction = () => {
    setIsCustomStudioOpen(true);
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
          <Text style={styles.permissionText as any}>
            Ứng dụng cần quyền Camera và Microphone
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={async () => {
              await requestCameraPermission();
              await requestMicPermission();
            }}
          >
            <Text style={styles.permissionButtonText as any}>Cấp quyền</Text>
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
      <View style={styles.streakWrapper}>
        <Streak refresh={streakRefresh} />
      </View>

      {/* Camera hoặc ảnh/video đã chụp */}
      <View style={styles.cameraContainer} ref={viewShotRef} collapsable={false}>
        {photoUri ? (
          mediaType === "video" ? (
            <Video
              source={{ uri: photoUri }}
              style={[
                styles.cameraBox as any,
                { backgroundColor: colors["base-200"] },
                facing === "front" ? { transform: [{ scaleX: -1 }] } : {}
              ] as any}
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
              shouldPlay={true}
              isLooping={true}
            />
          ) : (
            <Image
              source={{ uri: photoUri }}
              resizeMode="cover"
              style={[
                styles.cameraBox as any,
                facing === "front" ? { transform: [{ scaleX: -1 }] } : {}
              ] as any} />
          )
        ) : (
          <CameraView
            ref={cameraRef}
            style={[styles.cameraBox as any, { backgroundColor: colors["base-200"] }]}
            facing={facing}
            mode={captureMode}
            videoQuality="1080p" // 👈 Lower quality to save memory (prevents OOM)
            mirror={facing === "front"}
            autofocus="on"
          />
        )}

        <BorderProgress isRecording={uiRecording} duration={MAX_VIDEO_DURATION} hasMedia={!!photoUri} />

        {/* Xóa overlay Đang chụp để cảm giác nhanh hơn */}
        {photoUri && (
          <AutoResizeCaption
            postOverlay={postOverlay}
            setPostOverlay={setPostOverlay}
          />
        )}
      </View>
      {/* <Streak refresh={streakRefresh} /> */}

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
        onStopRecording={onUserRelease}
        onFlipCamera={handleFlipCamera}
        onOpenGallery={handleOpenGallery}
        onSend={handleSendPhoto}
        onCancel={handleCancelPhoto}
        onCustomAction={handleCustomAction}
        mode={captureMode}
        onModeChange={handleModeChange}
        isRecording={uiRecording}
        isSending={isSending}
      />

      {/* History Button */}
      {/* <View style={styles.historyButtonContainer}>
        <Pressable style={styles.historyButton} onPress={() => goToPage("history")}>
          <Text style={[styles.historyText, { color: colors["base-content"] }]}>Lịch sử</Text>
          <Octicons name="chevron-down" size={24} color={colors["base-content"]} />
        </Pressable>
      </View> */}

      {/* Custom Studio Modal */}
      <CustomStudioModal
        isVisible={isCustomStudioOpen}
        onClose={() => setIsCustomStudioOpen(false)}
        postOverlay={postOverlay}
        setPostOverlay={setPostOverlay}
      />
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
    // backgroundColor: "black", -> handled inline
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
  // historyButtonContainer: {
  //   justifyContent: "center",
  //   alignItems: "center",
  //   marginTop: 16,
  // },
  // historyButton: {
  //   justifyContent: "center",
  //   alignItems: "center",
  //   flexDirection: "column",
  // },
  // historyText: {
  //   color: "white",
  //   fontSize: 20,
  //   fontWeight: "600",
  // },
  streakWrapper: {
    position: "absolute",
    top: 35,        // 👈 chỉnh cao thấp tại đây
    alignSelf: "flex-start",
    zIndex: 100,
    marginLeft: 60,
  },
});