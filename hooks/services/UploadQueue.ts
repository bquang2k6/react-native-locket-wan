import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { uploadMedia, MediaUploadPayload } from './uploadMedia';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = 'offline_upload_queue';
const QUEUE_DIR = FileSystem.documentDirectory + 'upload_queue/';

export interface QueueItem {
    id: string;
    timestamp: number;
    payload: MediaUploadPayload;
    retryCount: number;
}

const ensureDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(QUEUE_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(QUEUE_DIR, { intermediates: true });
    }
};

let isProcessing = false;
type ProgressCallback = (id: string, progress: number) => void;
const listeners = new Set<ProgressCallback>();

export const UploadQueue = {
    /**
     * Add a progress listener
     */
    addListener: (callback: ProgressCallback) => {
        listeners.add(callback);
    },

    /**
     * Remove a progress listener
     */
    removeListener: (callback: ProgressCallback) => {
        listeners.delete(callback);
    },

    /**
     * Add an upload task to the queue.
     * Moves the file from cache to persistent storage.
     */
    addToQueue: async (payload: MediaUploadPayload) => {
        try {
            await ensureDirExists();
            const { mediaInfo } = payload;
            const fileUri = mediaInfo.file.uri;

            // Generate unique filename for persistence
            const fileName = fileUri.split('/').pop() || `upload_${Date.now()}`;
            const newPath = QUEUE_DIR + fileName;

            // Move file to permanent location
            await FileSystem.moveAsync({
                from: fileUri,
                to: newPath
            });

            // Update payload with new path
            const newPayload = { ...payload };
            newPayload.mediaInfo.file.uri = newPath;

            const newItem: QueueItem = {
                id: Date.now().toString() + Math.random().toString(),
                timestamp: Date.now(),
                payload: newPayload,
                retryCount: 0,
            };

            // Get current queue
            const currentQueueStr = await AsyncStorage.getItem(QUEUE_KEY);
            const currentQueue: QueueItem[] = currentQueueStr ? JSON.parse(currentQueueStr) : [];

            currentQueue.push(newItem);

            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(currentQueue));
            console.log('📥 Added to upload queue:', newItem.id);
            return true;
        } catch (error) {
            console.error('❌ Failed to add to queue:', error);
            return false;
        }
    },

    /**
     * Get the current queue
     */
    getQueue: async (): Promise<QueueItem[]> => {
        try {
            const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
            return queueStr ? JSON.parse(queueStr) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Remove item from queue (and delete file)
     */
    removeFromQueue: async (id: string, deleteFile: boolean = true) => {
        try {
            const queue = await UploadQueue.getQueue();
            const itemToRemove = queue.find(i => i.id === id);
            const newQueue = queue.filter(item => item.id !== id);

            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));

            if (deleteFile && itemToRemove?.payload.mediaInfo.file.uri) {
                await FileSystem.deleteAsync(itemToRemove.payload.mediaInfo.file.uri, { idempotent: true });
            }
        } catch (error) {
            console.error('Failed to remove from queue:', error);
        }
    },

    /**
     * Process the queue
     */
    processQueue: async () => {
        if (isProcessing) {
            console.log('⏳ UploadQueue is already processing, skipping.');
            return;
        }

        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            console.log('📴 Offline, skipping queue processing');
            return;
        }

        const queue = await UploadQueue.getQueue();
        if (queue.length === 0) return;

        isProcessing = true;
        console.log(`🔄 Processing queue: ${queue.length} items`);

        try {
            for (const item of queue) {
                try {
                    console.log(`🚀 Retrying upload: ${item.id}`);
                    // Check if file still exists
                    const fileInfo = await FileSystem.getInfoAsync(item.payload.mediaInfo.file.uri);
                    if (!fileInfo.exists) {
                        console.warn(`⚠️ File not found for item ${item.id}, removing from queue.`);
                        await UploadQueue.removeFromQueue(item.id, false);
                        continue;
                    }

                    // Prepare payload with progress callback
                    const uploadPayload = {
                        ...item.payload,
                        onProgress: (progress: number) => {
                            listeners.forEach(cb => cb(item.id, progress));
                        }
                    };

                    await uploadMedia(uploadPayload);

                    console.log(`✅ Queue item ${item.id} uploaded successfully`);
                    await UploadQueue.removeFromQueue(item.id, true);

                } catch (error) {
                    console.error(`❌ Failed to process queue item ${item.id}:`, error);
                }
            }
        } finally {
            isProcessing = false;
            console.log('🏁 Queue processing finished.');
        }
    }
};
