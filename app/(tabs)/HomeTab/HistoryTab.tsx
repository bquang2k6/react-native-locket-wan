import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
// import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import SelectionHeaderFriend from '../../../components/ui/SelectionHeaderFriend';


const { width, height } = Dimensions.get('window');

const BottomHomeScreen = () => {
  // Mock states for UI demonstration
  const isBottomOpen = true;
  const loadingServer = false;
  const selectedFriendUid = null;
  const displayPosts = [];
  const selectedAnimate = false;
  const imageInfo = null;
  const selectedVideo = null;
  const selectedImage = null;
  const reactionInput = '';
  const selectedEmoji = '';
  const showEmojiPicker = false;
  const isOwner = false;
  const showActivityModal = false;

  const quickEmojis = ['💛', '🤣', '😍', '😊', '👏', '🔥', '❤️', '😢', '😮', '😡'];

  const renderMediaItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => {}}
    >
      <View style={styles.mediaContainer}>
        {item.video_url ? (
          <Video
            source={{ uri: item.video_url }}
            style={styles.media}
            resizeMode="cover"
            shouldPlay={false}
            isLooping
            isMuted
          />
        ) : (
          <Image
            source={{ uri: item.thumbnail_url || item.image_url }}
            style={styles.media}
          />
        )}
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>
            {new Date(item.date).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerContent}>
         
        </View>
      </View> */}
      {/* <SelectionHeaderFriend
        friendCount={0}
        onPressProfile={() => goToPage('profile')}
        onPressMessage={() => goToPage('messages')}
      /> */}

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, loadingServer && styles.buttonDisabled]}
          disabled={loadingServer}
        >
          <Text style={styles.buttonText}>
            {loadingServer ? 'Đang tải...' : 'Lấy bài viết'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter indicator */}
      {selectedFriendUid && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterText}>
            Đang xem bài viết của: Người dùng
          </Text>
          <Text style={styles.filterSubtext}>
            Nếu muốn xem thêm thì ấn nút lấy bài viết
          </Text>
        </View>
      )}

      {/* Media grid */}
      <FlatList
        data={displayPosts}
        renderItem={renderMediaItem}
        keyExtractor={(item, index) => `post-${item.id}-${index}`}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={
          !loadingServer && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Chưa có ảnh nào, hãy đăng ảnh để xem nhé!
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          loadingServer && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
            </View>
          )
        }
      />

      {/* Full media modal */}
      <Modal
        visible={selectedAnimate && imageInfo !== null}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.mediaPreviewContainer}>
              {selectedVideo ? (
                <Video
                  source={{ uri: selectedVideo }}
                  style={styles.mediaPreview}
                  resizeMode="cover"
                  shouldPlay
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.mediaPreview}
                />
              )}

              {/* Time badge */}
              <View style={styles.previewTimeBadge}>
                <Text style={styles.previewTimeText}>
                  {imageInfo && new Date(imageInfo.date).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {/* Close button */}
              <TouchableOpacity style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Caption overlay */}
              {imageInfo?.captions?.[0] && (
                <View style={styles.captionContainer}>
                  <View style={styles.captionBadge}>
                    <Text style={styles.captionText}>
                      {imageInfo.captions[0].caption}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* User info */}
            {imageInfo?.user && (
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: '/prvlocket.png' }}
                  style={styles.userAvatar}
                />
                <Text style={styles.userName}>Người dùng</Text>
              </View>
            )}

            {/* Reaction or Activity */}
            <View style={styles.interactionContainer}>
              {isOwner ? (
                <TouchableOpacity style={styles.activityButton}>
                  <Image
                    source={{ uri: '/start.png' }}
                    style={styles.activityIcon}
                  />
                  <Text style={styles.activityText}>Hoạt động</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.reactionContainer}>
                  <TextInput
                    style={styles.reactionInput}
                    placeholder="Nhập icon"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={reactionInput}
                  />
                  <View style={styles.quickEmojis}>
                    {quickEmojis.slice(0, 4).map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[
                          styles.emojiButton,
                          selectedEmoji === emoji && styles.emojiButtonSelected,
                        ]}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!selectedEmoji && !reactionInput.trim()) && styles.sendButtonDisabled,
                    ]}
                    disabled={!selectedEmoji && !reactionInput.trim()}
                  >
                    <Text style={styles.sendButtonText}>→</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Expanded emoji picker */}
            {showEmojiPicker && (
              <View style={styles.emojiPicker}>
                <View style={styles.emojiGrid}>
                  {quickEmojis.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.emojiPickerButton}
                    >
                      <Text style={styles.emojiPickerText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Bottom navigation bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton}>
          <Text style={styles.bottomButtonIcon}>⊞</Text>
        </TouchableOpacity>

        <View style={styles.centerButtonContainer}>
          <View style={styles.centerButtonOuter} />
          <View style={styles.centerButtonInner} />
        </View>

        {true && (
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonIcon}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    marginTop: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    marginTop: 80,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterIndicator: {
    alignItems: 'center',
    marginVertical: 8,
  },
  filterText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
  },
  filterSubtext: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  gridContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  mediaItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    maxWidth: width / 3 - 16,
  },
  mediaContainer: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  timeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(229, 231, 235, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 10,
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    alignItems: 'center',
    padding: 16,
    minHeight: height,
  },
  mediaPreviewContainer: {
    width: width - 32,
    aspectRatio: 1,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#3b82f6',
    overflow: 'hidden',
    marginTop: 80,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  previewTimeBadge: {
    position: 'absolute',
    top: 8,
    left: 12,
    backgroundColor: 'rgba(229, 231, 235, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewTimeText: {
    fontSize: 12,
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 231, 235, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#000',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captionBadge: {
    backgroundColor: 'rgba(229, 231, 235, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    maxWidth: '80%',
  },
  captionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229, 231, 235, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 16,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userName: {
    fontSize: 14,
    color: '#000',
  },
  interactionContainer: {
    width: '100%',
    maxWidth: width - 32,
    marginTop: 160,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229, 231, 235, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityIcon: {
    width: 30,
    height: 30,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 231, 235, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  reactionInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    minWidth: 0,
  },
  quickEmojis: {
    flexDirection: 'row',
    gap: 4,
  },
  emojiButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiButtonSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 18,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  sendButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  emojiPicker: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(229, 231, 235, 0.95)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiPickerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiPickerText: {
    fontSize: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 16,
    paddingVertical: 8,

    backgroundColor: '#000000ff',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  bottomButton: {
    padding: 1,
  },
  // icon lưới
  bottomButtonIcon: {
    fontSize: 30,
    marginBottom: 30,
    marginLeft: 12,
    color: '#fffdfdff',
  },
  // nút ở giữa
  centerButtonContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginLeft: 10
  },
  centerButtonOuter: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 10,
  },
  centerButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 36,
    backgroundColor: '#ffffffff',
  },
  // sọt rác
  deleteButton: {
    padding: 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#ffffffff',
    marginBottom: 31,
    marginRight: 10,
  },
  deleteButtonIcon: {
    fontSize: 20,
  },
});

export default BottomHomeScreen;