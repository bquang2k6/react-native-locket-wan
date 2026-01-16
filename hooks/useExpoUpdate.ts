import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Updates from "expo-updates";

/**
 * Hook to manage Expo Updates (EAS Update)
 */
export const useExpoUpdate = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    const isSupported = Updates.isEnabled;

    const checkForUpdates = async (showNoUpdateAlert = false) => {
        if (!isSupported) {
            if (showNoUpdateAlert) {
                Alert.alert(
                    "Thông báo",
                    "Tính năng cập nhật chưa được tích hợp vào bản build này hoặc bạn đang dùng Expo Go.\n\nVui lòng build lại ứng dụng (npx expo run:android) để sử dụng."
                );
            }
            return;
        }

        if (__DEV__) {
            if (showNoUpdateAlert) {
                Alert.alert("Thông báo", "Expo Updates không hoạt động trong môi trường Development (Expo Go/Dev Client).");
            }
            return;
        }

        try {
            setIsChecking(true);
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                setUpdateAvailable(true);
                Alert.alert(
                    "Bản cập nhật mới",
                    "Đã có bản cập nhật mới. Bạn có muốn tải về ngay không?",
                    [
                        { text: "Để sau", style: "cancel" },
                        { text: "Tải ngay", onPress: () => fetchUpdate() }
                    ]
                );
            } else {
                if (showNoUpdateAlert) {
                    Alert.alert("Thông báo", "Ứng dụng của bạn đã là phiên bản mới nhất.");
                }
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra cập nhật:", error);
            if (showNoUpdateAlert) {
                Alert.alert("Lỗi", "Không thể kiểm tra bản cập nhật. Vui lòng thử lại sau.");
            }
        } finally {
            setIsChecking(false);
        }
    };

    const fetchUpdate = async () => {
        try {
            setIsDownloading(true);
            await Updates.fetchUpdateAsync();
            Alert.alert(
                "Thành công",
                "Bản cập nhật đã được tải về. Ứng dụng sẽ khởi động lại để áp dụng.",
                [{ text: "OK", onPress: () => Updates.reloadAsync() }]
            );
        } catch (error) {
            console.error("Lỗi khi tải bản cập nhật:", error);
            Alert.alert("Lỗi", "Không thể tải bản cập nhật. Vui lòng thử lại sau.");
        } finally {
            setIsDownloading(false);
            setUpdateAvailable(false);
        }
    };

    return {
        isChecking,
        isDownloading,
        updateAvailable,
        checkForUpdates
    };
};
