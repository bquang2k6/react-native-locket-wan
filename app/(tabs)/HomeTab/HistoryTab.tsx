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
import { useTheme } from '@/context/ThemeContext';

import ModalSlide from '@/components/History/ModalSlide';

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
  const { colors } = useTheme();

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

  // useEffect(() => {
  //   if (user?.localId) {
  //     loadMoments(false, 50); // Initial load with 50 items
  //   }
  // }, [user?.localId]);

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

    return posts.map(moment => {
      const momentFriend = friendDetails.find(f => f.uid === moment.user || f.uid === moment.user?.uid || f.uid === moment.user?.localId);
      const isOwner = isUserMatch(moment.user, user?.localId);
      const creatorName = momentFriend
        ? `${momentFriend.firstName || ""} ${momentFriend.lastName || ""}`.trim() || momentFriend.username || "Người dùng"
        : (moment.user?.displayName || moment.user?.username || (isOwner ? "Bạn" : "Người dùng"));
      const creatorAvatar = momentFriend?.profilePic || momentFriend?.profilePicture || moment.user?.profilePicture || (isOwner ? user?.profilePicture : null) || "/prvlocket.png";

      return {
        ...moment,
        creatorName,
        creatorAvatar,
        isOwner
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
    <View style={[styles.container, { backgroundColor: colors["base-100"] }]}>
      {/* Header Selector */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.selectorButton, { backgroundColor: colors["base-200"], borderColor: colors["base-300"] }]}
          onPress={() => {
            console.log("Opening friend modal");
            setIsFriendModalOpen(true);
          }}
        >
          <MaterialCommunityIcons name="account-group" size={24} color={colors["base-content"]} />
          <Text style={[styles.selectorText, { color: colors["base-content"] }]}>{selectedFriendName}</Text>
          <Feather name="chevron-down" size={18} color={colors["base-content"]} />
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, loadingServer && styles.buttonDisabled]}
          onPress={() => loadMoments(false)}
          disabled={loadingServer}
        >
          <Text style={[styles.buttonText, { color: colors["base-100"] }]}>
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
              <Text style={[styles.emptyText, { color: colors["base-content"], opacity: 0.7 }]}>
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
          <View style={[styles.friendModalContent, { backgroundColor: colors["base-200"] }]}>
            <View style={styles.friendModalHeader}>
              <Text style={[styles.friendModalTitle, { color: colors["base-content"] }]}>Danh sách bạn bè</Text>
              <TouchableOpacity onPress={() => setIsFriendModalOpen(false)}>
                <Feather name="x" size={24} color={colors["base-content"]} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors["base-100"] }]}>
              <Feather name="search" size={20} color={colors["base-content"]} />
              <TextInput
                style={[styles.searchInput, { color: colors["base-content"] }]}
                placeholder="Tìm kiếm bạn bè..."
                placeholderTextColor={colors["base-content"] + "80"}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>

            <ScrollView style={styles.friendList}>
              {/* Option: Everyone */}
              <TouchableOpacity
                style={[styles.friendItem, !selectedFriendUid && [styles.friendItemSelected, { backgroundColor: colors.primary + "33", borderColor: colors.primary + "66" }]]}
                onPress={() => handleSelectFriend(null, "Mọi người")}
              >
                <View style={[styles.friendAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <MaterialCommunityIcons name="account-group" size={24} color={colors["base-100"]} />
                </View>
                <Text style={[styles.friendName, { color: colors["base-content"] }]}>Mọi người</Text>
              </TouchableOpacity>

              {/* Option: Me */}
              {user && (
                <TouchableOpacity
                  style={[styles.friendItem, selectedFriendUid === user.localId && [styles.friendItemSelected, { backgroundColor: colors.primary + "33", borderColor: colors.primary + "66" }]]}
                  onPress={() => handleSelectFriend(user.localId, "Bạn")}
                >
                  <Image
                    source={{ uri: user.profilePicture || "/prvlocket.png" }}
                    style={[styles.friendAvatar, { borderColor: colors["base-300"] }]}
                  />
                  <Text style={[styles.friendName, { color: colors["base-content"] }]}>Bạn</Text>
                </TouchableOpacity>
              )}

              {/* Friends List */}
              {filteredFriends.map(friend => (
                <TouchableOpacity
                  key={friend.uid}
                  style={[styles.friendItem, selectedFriendUid === friend.uid && [styles.friendItemSelected, { backgroundColor: colors.primary + "33", borderColor: colors.primary + "66" }]]}
                  onPress={() => handleSelectFriend(friend.uid, `${friend.firstName || ""} ${friend.lastName || ""}`.trim() || friend.username || "Người dùng")}
                >
                  <Image
                    source={{ uri: friend.profilePic || friend.profilePicture || "/prvlocket.png" }}
                    style={[styles.friendAvatar, { borderColor: colors["base-300"] }]}
                  />
                  <Text style={[styles.friendName, { color: colors["base-content"] }]}>
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
        <View style={[styles.modalOverlay, { backgroundColor: colors["base-100"] + "F2" }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseMedia} />

          <FlatList
            data={displayPosts}
            keyExtractor={(item, index) => `detail-${item.id}-${index}`}
            renderItem={({ item, index }) => (
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
                onDelete={handleDelete}
                isOwner={item.isOwner}
                friendDetails={friendDetails}
                user={user}
              />
            )}
            pagingEnabled
            snapToInterval={height}
            snapToAlignment="start"
            decelerationRate="fast"
            initialScrollIndex={activeIndex}
            getItemLayout={(_, index) => ({
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
    marginTop: 100,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  mediaPreviewOuter: {
    width: width - 0,
    aspectRatio: 1,
    borderRadius: 40,
    borderWidth: 0,
    // borderColor: '#3b82f6', // handled inline
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
  deleteButtonTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});