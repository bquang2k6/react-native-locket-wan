import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, Animated, Easing } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { UploadQueue, QueueItem } from '@/hooks/services/UploadQueue';
import * as FileSystem from 'expo-file-system/legacy';
import { Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function UploadQueueScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [uploads, setUploads] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileSizes, setFileSizes] = useState<Record<string, string>>({});
  const [progresses, setProgresses] = useState<Record<string, number>>({});



    const rotateAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        let animation: Animated.CompositeAnimation | null = null;

        if (loading) {
            animation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
            );
            animation.start();
        } else {
            rotateAnim.stopAnimation();
            rotateAnim.setValue(0);
        }

        return () => {
            animation?.stop();
        };
    }, [loading]);
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });
    
    useEffect(() => {
        loadQueue();

        const interval = setInterval(() => {
            loadQueue();
        }, 2000);

        const handleProgress = (id: string, progress: number) => {
            setProgresses(prev => ({ ...prev, [id]: progress }));
        };

        UploadQueue.addListener(handleProgress);

        return () => {
            clearInterval(interval);
            UploadQueue.removeListener(handleProgress);
        };
    }, []);










  const loadQueue = async () => {
    setLoading(true);
    try {
      const queue = await UploadQueue.getQueue();
      // Sort by timestamp (newest first)
      const sortedQueue = [...queue].sort((a, b) => b.timestamp - a.timestamp);
      setUploads(sortedQueue);

      // Fetch file sizes
      const sizes: Record<string, string> = {};
      for (const item of sortedQueue) {
        try {
          const info = await FileSystem.getInfoAsync(item.payload.mediaInfo.file.uri);
          if (info.exists) {
            sizes[item.id] = (info.size / (1024 * 1024)).toFixed(2) + ' MB';
          }
        } catch (e) {
          sizes[item.id] = 'Error';
        }
      }
      setFileSizes(sizes);
    } catch (e) {
      console.error('Failed to load queue:', e);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string, progress: number = 0) => {
    if (progress > 0 && progress < 100) return colors.info || '#3b82f6';
    switch (status) {
      case 'uploading':
        return colors.info || '#3b82f6';
      case 'completed':
        return colors.success || '#10b981';
      case 'waiting':
        return colors.warning || '#f59e0b';
      case 'error':
        return colors.error || '#ef4444';
      default:
        return colors['base-content'];
    }
  };

  const getStatusText = (status: string, progress: number = 0) => {
    if (progress > 0 && progress < 100) return `Đang tải ${progress}%`;
    switch (status) {
      case 'uploading':
        return 'Đang tải lên';
      case 'completed':
        return 'Hoàn thành';
      case 'waiting':
        return 'Đang chờ';
      case 'error':
        return 'Lỗi';
      default:
        return 'Sẵn sàng';
    }
  };

  const handleRemove = async (id: string) => {
    Alert.alert(
      'Xóa tệp',
      'Bạn có chắc chắn muốn xóa tệp này khỏi danh sách chờ?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await UploadQueue.removeFromQueue(id);
            loadQueue();
          }
        }
      ]
    );
  };

  const handleRetryAll = async () => {
    await UploadQueue.processQueue();
    loadQueue();
  };

  const renderItem = ({ item }: { item: QueueItem }) => {
    const progress = progresses[item.id] || 0;
    const isUploading = progress > 0 && progress < 100;

    return (
      <View style={[styles.itemContainer, { backgroundColor: colors['base-200'], borderColor: colors['base-300'] }]}>
        <Image
          source={{ uri: item.payload.mediaInfo.file.uri }}
          style={styles.thumbnail}
        />

        <View style={styles.infoContainer}>
          <Text style={[styles.fileName, { color: colors['base-content'] }]} numberOfLines={1}>
            {item.payload.mediaInfo.file.name}
          </Text>

          <View style={styles.detailsRow}>
            <Text style={[styles.fileSize, { color: colors['base-content'], opacity: 0.6 }]}>
              {fileSizes[item.id] || 'Đang tính...'}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: item.payload.mediaInfo.type === 'video' ? colors.primary : colors.secondary }]}>
              <Text style={styles.typeText}>
                {item.payload.mediaInfo.type === 'video' ? '🎥 Video' : '🖼️ Ảnh'}
              </Text>
            </View>
          </View>

          {isUploading && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBarBase, { backgroundColor: colors['base-300'] }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: colors.primary
                    }
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: getStatusColor('waiting', progress) }]}>
              {getStatusText('waiting', progress)}
            </Text>

            <TouchableOpacity
              onPress={() => handleRemove(item.id)}
              style={[styles.removeButton, { backgroundColor: colors.error || '#ef4444' }]}
              disabled={isUploading}
            >
              <Text style={styles.removeButtonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors['base-100'] }]}>
      <View style={[styles.header, { backgroundColor: colors['base-200'], borderBottomColor: colors['base-300'] }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Octicons name="chevron-left" size={32} color={colors['base-content']} />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadQueue} disabled={loading} style={styles.syncButton}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Octicons name="sync" size={24} color={colors['base-content']} style={{ opacity: loading ? 0.6 : 1 }}/>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: colors['base-content'] }]}>
          Danh sách chờ tải
        </Text>

        <View style={styles.statsContainer}>
          <Text style={[styles.statsText, { color: colors['base-content'], opacity: 0.7 }]}>
            {uploads.length} tệp trong hàng đợi
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={uploads}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Octicons name="inbox" size={64} color={colors['base-content']} style={{ opacity: 0.1, marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: colors['base-content'], opacity: 0.5 }]}>
                Không có tệp nào trong danh sách chờ
              </Text>
            </View>
          }
        />
      )}

      {uploads.length > 0 && (
        <View style={[styles.footer, { borderTopColor: colors['base-300'], backgroundColor: colors['base-200'] }]}>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRetryAll}
          >
            <Text style={styles.retryButtonText}>Tải lên lại ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 4,
    marginLeft: -8,
  },
  syncButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statsContainer: {
    marginTop: 2,
  },
  statsText: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  thumbnail: {
    width: 85,
    height: 85,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    height: 6,
    marginVertical: 8,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarBase: {
    flex: 1,
    height: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  fileSize: {
    fontSize: 13,
    marginRight: 10,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  removeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 35,
    borderTopWidth: 1,
  },
  retryButton: {
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },
});