import { useEffect, useState } from "react";

/**
 * Custom hook to handle HEIC images
 * Note: expo-image (Image component from expo-image) handles HEIC natively on iOS
 * and will automatically convert on Android, so we just pass through the URLs
 * 
 * @param images - Array of image URLs
 * @returns Object with images array and loading state
 */
export function useHeicImages(images: string[]) {
    const [resolved, setResolved] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!images || images.length === 0) {
            setResolved([]);
            setLoading(false);
            return;
        }

        // Just pass through the URLs - expo-image handles HEIC natively
        setResolved(images);
        setLoading(false);
    }, [images]);

    return { images: resolved, loading };
}
