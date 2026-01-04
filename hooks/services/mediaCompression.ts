import * as ImageManipulator from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Compresses an image to be under 1MB using expo-image-manipulator.
 */
export const compressImage = async (uri: string): Promise<string> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) throw new Error("File does not exist: " + uri);

        // If already < 1MB, skip compression
        if ('size' in fileInfo && fileInfo.size < 1024 * 1024) {
            console.log("📸 Image is already < 1MB, skipping compression.");
            return uri;
        }

        console.log("📸 Compressing image with ImageManipulator...");

        // Initial aggressive compression
        let result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1200 } }], // Resize to reasonable 1200px width
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // If still > 1MB, compress more
        const resultInfo = await FileSystem.getInfoAsync(result.uri);
        if (resultInfo.exists && 'size' in resultInfo && resultInfo.size > 1024 * 1024) {
            console.warn("⚠️ Image still > 1MB, applying more aggressive compression...");
            result = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 800 } }], // Resize more
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );
        }

        if (resultInfo.exists && 'size' in resultInfo) {
            console.log(`✅ Image compressed: ${(resultInfo.size / (1024 * 1024)).toFixed(2)} MB`);
        }

        return result.uri;
    } catch (error) {
        console.error("❌ Image compression failed:", error);
        return uri;
    }
};

/**
 * Compresses a video to be under 5MB using react-native-compressor.
 */
export const compressVideo = async (uri: string): Promise<string> => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) throw new Error("File does not exist: " + uri);

        // If already < 5MB, skip compression
        if ('size' in fileInfo && fileInfo.size < 5 * 1024 * 1024) {
            console.log("🎥 Video is already < 5MB, skipping compression.");
            return uri;
        }

        console.log("🎥 Compressing video with react-native-compressor...");

        // Use react-native-compressor for video
        // bitRate: we target roughly 4.5MB for a 10s video?
        // Actually, react-native-compressor has good default presets.
        const compressedUri = await Video.compress(
            uri,
            {
                compressionMethod: 'auto',
                minimumVideoBitrate: 1000000, // 1Mbps
            },
            (progress) => {
                // Optional: log progress
                // console.log('Compression Progress: ', progress);
            }
        );

        const newInfo = await FileSystem.getInfoAsync(compressedUri);
        if (newInfo.exists && 'size' in newInfo) {
            console.log(`✅ Video compressed: ${(newInfo.size / (1024 * 1024)).toFixed(2)} MB`);
        }

        return compressedUri;
    } catch (error) {
        console.error("❌ Video compression failed:", error);
        return uri;
    }
};
