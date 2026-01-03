import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
// PagerView is still used in index.tsx, but we'll use FlatList here for the modal slides
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { fetchFriends, Friend } from '../../../hooks/services/friendsService';
import { fetchServerMoments, sendReaction, deleteServerMoment, TransformedMoment } from '../../../hooks/services/historyService';

// Memoized slide component to prevent unnecessary re-renders
const ModalSlide = React.memo(({
  item,
  index,
  activeIndex,
  creatorName,
  creatorAvatar,
  onClose,
  renderOverlayIcon,
  reactionInput,
  onReactionInputChange,
  onSendReaction,
  quickEmojis,
  selectedEmoji
}: any) => {
  return (
    <View style={styles.modalSlide}>
      <View style={styles.modalContent}>
        <View style={styles.modalUserHeader}>
          <Image source={{ uri: creatorAvatar }} style={styles.modalUserAvatar} />
          <View>
            <Text style={styles.modalUserName}>{creatorName}</Text>
            <Text style={styles.modalUserTime}>
              {new Date(item.date).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.mediaPreviewOuter}>
          <View style={styles.mediaPreviewContainer}>
            {item.video_url ? (
              <Video
                source={{ uri: item.video_url }}
                style={styles.mediaPreview}
                resizeMode={ResizeMode.COVER}
                shouldPlay={activeIndex === index}
                isLooping
              />
            ) : (
              <Image
                source={{ uri: (item.image_url || item.thumbnail_url) as string }}
                style={styles.mediaPreview}
                contentFit="cover"
              />
            )}

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {item.captions?.[0] && (
              <View style={styles.captionContainer}>
                <LinearGradient
                  colors={item.captions[0].background?.colors?.length >= 2
                    ? [item.captions[0].background.colors[0], item.captions[0].background.colors[1]]
                    : ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.6)']}
                  style={styles.captionBadge}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {item.captions[0].icon && renderOverlayIcon(item.captions[0].icon)}
                    <Text style={[styles.captionText, { color: item.captions[0].text_color || '#fff' }]}>
                      {item.captions[0].caption}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>
        </View>

        <View style={styles.interactionContainer}>
          <View style={styles.reactionContainer}>
            <TextInput
              style={styles.reactionInput}
              placeholder="Nhập icon"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={activeIndex === index ? reactionInput : ""}
              onChangeText={onReactionInputChange}
            />
            <View style={styles.quickEmojis}>
              {quickEmojis.slice(0, 4).map((emoji: string) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    (activeIndex === index && (selectedEmoji === emoji || reactionInput === emoji)) && styles.emojiButtonSelected,
                  ]}
                  onPress={() => onSendReaction(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.sendButton, (!reactionInput.trim() || activeIndex !== index) && styles.sendButtonDisabled]}
              disabled={!reactionInput.trim() || activeIndex !== index}
              onPress={() => onSendReaction(reactionInput)}
            >
              <Feather name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

const { width, height } = Dimensions.get('window');

const HistoryTab = ({ goToPage }: { goToPage: (page: string) => void }) => {
  const [user, setUser] = useState<any>(null);
  const [serverMoments, setServerMoments] = useState<TransformedMoment[]>([]);
  const [loadingServer, setLoadingServer] = useState(false);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Friend Selection States
  const [friendDetails, setFriendDetails] = useState<Friend[]>([]);
  const [selectedFriendUid, setSelectedFriendUid] = useState<string | null>(null);
  const [selectedFriendName, setSelectedFriendName] = useState("Mọi người");
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAnimate, setSelectedAnimate] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [reactionInput, setReactionInput] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");

  const [quickEmojis] = useState(["💛", "🤣", "😍", "😊", "👏", "🔥", "❤️", "😢", "😮", "😡"]);
  const [fetchErrorCount, setFetchErrorCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadFriends = async () => {
      const friends = await fetchFriends();
      setFriendDetails(friends);
    };
    loadFriends();
  }, []);

  const loadMoments = useCallback(async (append = false, limitOverride?: number) => {
    const targetUserId = user?.localId;
    // Allow initial load (pageToken null) even if hasMore is false (default)
    if (!targetUserId || loadingServer || (append && !hasMore) || fetchErrorCount > 3) return;

    try {
      setLoadingServer(true);
      const isFriendView = !!selectedFriendUid;
      const fetchLimit = limitOverride || (isFriendView ? 200 : 50);

      const res = await fetchServerMoments(targetUserId, append ? pageToken : null, fetchLimit);

      setServerMoments(prev => append ? [...prev, ...res.moments] : res.moments);
      setPageToken(res.nextPageToken);
      setHasMore(!!res.nextPageToken);
      setFetchErrorCount(0);
    } catch (err) {
      console.error("Load moments failed:", err);
      setFetchErrorCount(prev => prev + 1);
      if (!append) Alert.alert("Lỗi", "Không thể tải lịch sử bài viết.");
    } finally {
      setLoadingServer(false);
    }
  }, [user?.localId, pageToken, loadingServer, hasMore, fetchErrorCount, selectedFriendUid]);

  useEffect(() => {
    if (user?.localId) {
      loadMoments(false, 50); // Initial load with 50 items
    }
  }, [user?.localId]);

  const handleSelectFriend = useCallback((uid: string | null, name: string) => {
    console.log("Selecting friend:", name, uid);
    setSelectedFriendUid(uid);
    setSelectedFriendName(name);
    setIsFriendModalOpen(false);
    setSearchTerm("");

    // Reset moments and fetch with appropriate limit
    setServerMoments([]);
    setPageToken(null);
    setHasMore(true);

    // Small delay to ensure state updates before fetching
    setTimeout(() => {
      loadMoments(false, uid ? 200 : 50);
    }, 50);
  }, [loadMoments]);

  const isUserMatch = (postUser: any, targetUid: string) => {
    if (!targetUid) return true;
    if (!postUser) return false;
    if (typeof postUser === "string" || typeof postUser === "number") {
      return String(postUser) === String(targetUid);
    }
    if (typeof postUser === "object") {
      return (
        String(postUser.uid) === String(targetUid) ||
        String(postUser.localId) === String(targetUid) ||
        String(postUser.username) === String(targetUid) ||
        String(postUser.id) === String(targetUid)
      );
    }
    return false;
  };

  const displayPosts = useMemo(() => {
    let posts = serverMoments;
    if (selectedFriendUid) {
      posts = serverMoments.filter(post => isUserMatch(post.user, selectedFriendUid));
    }

    // Pre-calculate creator info for each post to avoid expensive lookups during FlatList scroll
    return posts.map(moment => {
      const momentFriend = friendDetails.find(f => f.uid === moment.user || f.uid === moment.user?.uid || f.uid === moment.user?.localId);
      const creatorName = momentFriend
        ? `${momentFriend.firstName || ""} ${momentFriend.lastName || ""}`.trim() || momentFriend.username || "Người dùng"
        : (moment.user?.displayName || moment.user?.username || (moment.user === user?.localId ? "Bạn" : "Người dùng"));
      const creatorAvatar = momentFriend?.profilePic || momentFriend?.profilePicture || moment.user?.profilePicture || (moment.user === user?.localId ? user?.profilePicture : null) || "/prvlocket.png";

      return {
        ...moment,
        creatorName,
        creatorAvatar
      };
    });
  }, [serverMoments, selectedFriendUid, friendDetails, user]);

  const currentMoment = useMemo(() => {
    if (!selectedAnimate || activeIndex < 0 || activeIndex >= displayPosts.length) return null;
    return displayPosts[activeIndex];
  }, [selectedAnimate, activeIndex, displayPosts]);

  const filteredFriends = useMemo(() => {
    return friendDetails.filter(f => {
      const fullName = `${f.firstName || ""} ${f.lastName || ""}`.toLowerCase();
      const username = (f.username || "").toLowerCase();
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || username.includes(term);
    });
  }, [friendDetails, searchTerm]);

  const handleOpenMedia = (item: TransformedMoment) => {
    const index = displayPosts.findIndex(p => p.id === item.id);
    setActiveIndex(index >= 0 ? index : 0);
    setSelectedAnimate(true);
  };

  const handleCloseMedia = () => {
    setSelectedAnimate(false);
    setReactionInput("");
    setSelectedEmoji("");
  };

  const handleSendReaction = async (emoji: string) => {
    if (!currentMoment) return;
    try {
      await sendReaction(currentMoment.id, emoji);
      Alert.alert("Thành công", `Đã gửi reaction ${emoji}`);
      setSelectedEmoji(emoji);
      setTimeout(() => setSelectedEmoji(""), 2000);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể gửi reaction");
    }
  };

  const handleDelete = async () => {
    if (!currentMoment || !user?.localId) return;

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bài viết này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteServerMoment(currentMoment.id, user.localId);
              const deletedId = currentMoment.id;
              setServerMoments(prev => prev.filter(m => m.id !== deletedId));
              handleCloseMedia();
              Alert.alert("Thành công", "Đã xóa bài viết");
            } catch (err) {
              Alert.alert("Lỗi", "Xóa thất bại");
            }
          }
        }
      ]
    );
  };

  const renderOverlayIcon = (icon: any) => {
    if (!icon) return null;
    if (icon.type === "emoji") return <Text style={{ fontSize: 15 }}>{icon.data}</Text>;
    if (icon.type === "sf_symbol") {
      return <Feather name="clock" size={20} color={icon.color || "#fff"} />;
    }
    if (icon.type === "image") {
      return (
        <Image
          source={{ uri: icon.data }}
          style={{ width: 22, height: 22 }}
          contentFit="contain"
        />
      );
    }
    return null;
  };

  const renderMediaItem = ({ item }: { item: TransformedMoment }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => handleOpenMedia(item)}
    >
      <View style={styles.mediaContainer}>
        {item.video_url ? (
          <Video
            source={{ uri: item.video_url }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isMuted
          />
        ) : (
          <Image
            source={{ uri: (item.thumbnail_url || item.image_url) as string }}
            style={styles.media}
            contentFit="cover"
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
      {/* Header Selector */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => {
            console.log("Opening friend modal");
            setIsFriendModalOpen(true);
          }}
        >
          <MaterialCommunityIcons name="account-group" size={24} color="#fff" />
          <Text style={styles.selectorText}>{selectedFriendName}</Text>
          <Feather name="chevron-down" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, loadingServer && styles.buttonDisabled]}
          onPress={() => loadMoments(false)}
          disabled={loadingServer}
        >
          <Text style={styles.buttonText}>
            {loadingServer ? 'Đang tải...' : 'Lấy bài viết'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Media grid */}
      <FlatList
        data={displayPosts}
        renderItem={renderMediaItem}
        keyExtractor={(item, index) => `post-${item.id}-${index}`}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        onEndReached={() => {
          if (hasMore && !loadingServer) {
            loadMoments(true);
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loadingServer ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Chưa có ảnh nào từ {selectedFriendName === "Mọi người" ? "bất kỳ ai" : selectedFriendName}.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingServer && pageToken ? (
            <ActivityIndicator style={{ margin: 20 }} color="#3b82f6" />
          ) : null
        }
      />

      {/* Friend Selection Modal */}
      <Modal
        visible={isFriendModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFriendModalOpen(false)}
      >
        <View style={styles.friendModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsFriendModalOpen(false)} />
          <View style={styles.friendModalContent}>
            <View style={styles.friendModalHeader}>
              <Text style={styles.friendModalTitle}>Danh sách bạn bè</Text>
              <TouchableOpacity onPress={() => setIsFriendModalOpen(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bạn bè..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            <ScrollView style={styles.friendList}>
              {/* Option: Everyone */}
              <TouchableOpacity
                style={[styles.friendItem, !selectedFriendUid && styles.friendItemSelected]}
                onPress={() => handleSelectFriend(null, "Mọi người")}
              >
                <View style={styles.friendAvatarPlaceholder}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#fff" />
                </View>
                <Text style={styles.friendName}>Mọi người</Text>
              </TouchableOpacity>

              {/* Option: Me */}
              {user && (
                <TouchableOpacity
                  style={[styles.friendItem, selectedFriendUid === user.localId && styles.friendItemSelected]}
                  onPress={() => handleSelectFriend(user.localId, "Bạn")}
                >
                  <Image
                    source={{ uri: user.profilePicture || "/prvlocket.png" }}
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>Bạn</Text>
                </TouchableOpacity>
              )}

              {/* Friends List */}
              {filteredFriends.map(friend => (
                <TouchableOpacity
                  key={friend.uid}
                  style={[styles.friendItem, selectedFriendUid === friend.uid && styles.friendItemSelected]}
                  onPress={() => handleSelectFriend(friend.uid, `${friend.firstName || ""} ${friend.lastName || ""}`.trim() || friend.username || "Người dùng")}
                >
                  <Image
                    source={{ uri: friend.profilePic || friend.profilePicture || "/prvlocket.png" }}
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>
                    {friend.firstName} {friend.lastName}
                  </Text>
                </TouchableOpacity>
              ))}

              {filteredFriends.length === 0 && searchTerm !== "" && (
                <Text style={styles.noResultText}>Không tìm thấy bạn bè nào.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full media modal (unchanged) */}
      <Modal
        visible={selectedAnimate}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseMedia}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseMedia} />

          <FlatList
            data={displayPosts}
            keyExtractor={(item) => `detail-${item.id}`}
            renderItem={({ item, index }: any) => (
              <ModalSlide
                item={item}
                index={index}
                activeIndex={activeIndex}
                creatorName={item.creatorName}
                creatorAvatar={item.creatorAvatar}
                onClose={handleCloseMedia}
                renderOverlayIcon={renderOverlayIcon}
                reactionInput={reactionInput}
                onReactionInputChange={setReactionInput}
                onSendReaction={handleSendReaction}
                quickEmojis={quickEmojis}
                selectedEmoji={selectedEmoji}
              />
            )}
            pagingEnabled
            horizontal={false}
            initialScrollIndex={activeIndex}
            getItemLayout={(data, index) => ({
              length: height,
              offset: height * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / height);
              setActiveIndex(index);
              setReactionInput(""); // Clear reaction input when sliding to a new post
            }}
            windowSize={5}
            initialNumToRender={activeIndex + 2}
            maxToRenderPerBatch={2}
            removeClippedSubviews={true}
            style={styles.modalPager}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>


      {/* Bottom navigation bar */}
      < View style={styles.bottomBar} >
        <TouchableOpacity style={styles.bottomButton} onPress={handleCloseMedia}>
          <MaterialCommunityIcons name="view-grid" size={30} color="#fff" />
        </TouchableOpacity>
        <Pressable onPress={() => goToPage("main")} style={styles.centerButtonContainer}>
          <View style={styles.centerButtonOuter} />
          <View style={styles.centerButtonInner} />
        </Pressable>
        <TouchableOpacity
          style={[styles.deleteButton, !currentMoment && { opacity: 0.5 }]}
          onPress={handleDelete}
          disabled={!currentMoment}
        >
          <Feather name="trash-2" size={24} color="#fff" />
        </TouchableOpacity>
      </View >
    </View >
  );
};

export default HistoryTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 99999, // Ensure it's above other elements in the tab
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    marginBottom: 8,
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
  gridContainer: {
    padding: 4,
    paddingBottom: 150,
  },
  mediaItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    maxWidth: width / 3 - 8,
  },
  mediaContainer: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 10,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  friendModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  friendModalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '80%',
    padding: 20,
  },
  friendModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  friendModalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  friendList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 15,
    marginBottom: 4,
  },
  friendItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#333',
  },
  friendAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  noResultText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  modalPager: {
    flex: 1,
    width: '100%',
  },
  modalSlide: {
    height: height,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    width: width - 40,
    paddingHorizontal: 10,
  },
  modalUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  modalUserName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalUserTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  mediaPreviewOuter: {
    width: width - 40,
    aspectRatio: 1,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#3b82f6',
    overflow: 'hidden',
  },
  mediaPreviewContainer: {
    flex: 1,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  previewTimeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewTimeText: {
    fontSize: 12,
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '85%',
  },
  captionText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  interactionContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  reactionInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    padding: 0,
  },
  quickEmojis: {
    flexDirection: 'row',
    gap: 6,
  },
  emojiButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiButtonSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 18,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#555',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  bottomButton: {
    padding: 8,
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonOuter: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  centerButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
});