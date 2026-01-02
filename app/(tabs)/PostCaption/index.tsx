import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronRight, 
  Link as LinkIcon,
  Heart,
  MessageCircle,
  Download,
  Send,
  Check,
  Trash2
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const POSTS_PER_PAGE = 10;
const API_URL = 'https://api4locketwan.antiviet.click/locketpro/user-themes/caption-posts';
const ADMIN_USERNAME = 'wan206';

// Helper function to calculate contrasting text color
const getContrastColor = (hexColor) => {
  if (!hexColor) return '#FFFFFF';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// Helper function to convert CSS gradient to React Native colors
const getPlanGradient = (plan) => {
  const planLower = plan?.toLowerCase() || '';
  
  switch (planLower) {
    case 'pro plus':
      return ['#0250c5', '#d43f8d'];
    case 'premium':
      return ['#7028e4', '#ffbd5b'];
    case 'premium lite':
      return ['#c58869', '#928618'];
    case 'free':
      return ['#64748b', '#94a3b8'];
    default:
      return ['#64748b', '#94a3b8'];
  }
};

// Post Card Component
const PostCard = ({ post, onDeleted, currentUser }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user_info, options, content, stats, created_at } = post;
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
    useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          // console.log('✅ Loaded user in PostsScreen:', parsed);
          setUser(parsed);
        } else {
          console.log('❌ No user in AsyncStorage');
        }
      } catch (e) {
        console.log('❌ Load user error:', e);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    checkIfDownloaded();
  }, [post.id]);

  const checkIfDownloaded = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem('savedPosts');
      const posts = savedPosts ? JSON.parse(savedPosts) : [];
      const exists = posts.some((p) => p.id === post.id);
      setIsDownloaded(exists);
    } catch (error) {
      console.error('Error checking download:', error);
    }
  };

  const toggleDownload = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem('savedPosts');
      const posts = savedPosts ? JSON.parse(savedPosts) : [];

      if (isDownloaded) {
        const updated = posts.filter((p) => p.id !== post.id);
        await AsyncStorage.setItem('savedPosts', JSON.stringify(updated));
      } else {
        const newEntry = { id: post.id, options: post.options };
        await AsyncStorage.setItem(
          'savedPosts',
          JSON.stringify([...posts, newEntry])
        );
      }

      setIsDownloaded(!isDownloaded);
    } catch (error) {
      console.error('Error toggling download:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa caption này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const adminKey = 'header';
              const response = await fetch(
                `${API_URL}/${post.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'admin-key': adminKey,
                  },
                }
              );
              
              if (response.ok) {
                Alert.alert('Thành công', 'Đã xóa caption thành công!');
                if (onDeleted) onDeleted(post.id);
              } else {
                Alert.alert('Lỗi', 'Xóa caption thất bại!');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Xóa caption thất bại!');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isAdmin = user_info?.username === ADMIN_USERNAME;
  const canDelete = currentUser?.username === ADMIN_USERNAME;
  const planGradient = getPlanGradient(user_info?.plan);
  const hasPlan = user_info?.plan && 
                  user_info.plan !== '' && 
                  user_info.plan.toLowerCase() !== 'no plan' && 
                  user_info.plan.toLowerCase() !== 'none';
  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: user_info?.profilePicture }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.displayName}>
                {user_info?.displayName || 'Anonymous'}
              </Text>
              <Text style={styles.dotSeparator}> • </Text>
              
              {/* Admin Badge */}
              {isAdmin && (
                <LinearGradient
                  colors={['#FBBF24', '#F97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Text style={styles.badgeText}>Admin</Text>
                </LinearGradient>
              )}
              
              {/* Plan Badge */}
              {hasPlan ? (
                <LinearGradient
                  colors={planGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Text style={styles.badgeText}>
                    {user_info.plan.charAt(0).toUpperCase() + user_info.plan.slice(1)}
                  </Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={['#64748B', '#94A3B8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Text style={styles.badgeText}>No Plan</Text>
                </LinearGradient>
              )}
            </View>
            <Text style={styles.username}>
              @{user_info?.username || 'Anonymous'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.dateText}>{formatDate(created_at)}</Text>
      </View>

      {/* Caption with Gradient Background */}
      <View style={styles.captionContainer}>
        <LinearGradient
          colors={[
            options?.color_top || '#000000',
            options?.color_bottom || '#000000',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.captionBox}
        >
          <Text
            style={[
              styles.captionText,
              {
                color: options?.color_text || getContrastColor(options?.color_top),
              },
            ]}
          >
            {options?.icon && <Text>{options.icon} </Text>}
            {options?.caption || 'Caption'}
          </Text>
        </LinearGradient>
      </View>

      {/* Content */}
      {content && (
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{content}</Text>
        </View>
      )}

      {/* Actions and Stats */}
      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statButton}>
            <Heart size={20} color="#6b7280" />
            <Text style={styles.statText}>{stats?.hearts || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statButton}>
            <MessageCircle size={20} color="#6b7280" />
            <Text style={styles.statText}>{stats?.comments || 0}</Text>
          </TouchableOpacity>

          <View style={styles.statButton}>
            <Download size={20} color="#6b7280" />
            <Text style={styles.statText}>{stats?.downloads || 0}</Text>
          </View>

          <TouchableOpacity style={styles.statButton}>
            <Send size={20} color="#6b7280" />
            <Text style={styles.statText}>{stats?.shares || 0}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isDownloaded ? styles.actionButtonSaved : styles.actionButtonNormal,
            ]}
            onPress={toggleDownload}
          >
            {isDownloaded ? (
              <>
                <Check size={16} color="#059669" />
                <Text style={styles.actionTextSaved}>Đã lưu</Text>
              </>
            ) : (
              <Text style={styles.actionTextNormal}>Lưu</Text>
            )}
          </TouchableOpacity>

          {/* Delete Button (Admin only) */}
          {canDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={16} color="#dc2626" />
              <Text style={styles.deleteText}>
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Main Screen Component
const PostsScreen = () => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
    // console.log("currentUser:", user);
  // console.log("currentUser.username:", user?.username);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          // console.log('✅ Loaded user in PostsScreen:', parsed);
          setUser(parsed);
        } else {
          console.log('❌ No user in AsyncStorage');
        }
      } catch (e) {
        console.log('❌ Load user error:', e);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();

      const uniquePosts = data.reduce((acc, post) => {
        const existingIndex = acc.findIndex((p) => p.id === post.id);
        if (existingIndex === -1) {
          acc.push(post);
        } else {
          const existing = acc[existingIndex];
          const existingDate = new Date(existing.created_at);
          const newDate = new Date(post.created_at);
          if (newDate > existingDate) {
            acc[existingIndex] = post;
          }
        }
        return acc;
      }, []);

      setPosts(uniquePosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const openProfile = () => {
    if (user?.username) {
      Linking.openURL(`https://locket.cam/${user.username}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <Text style={styles.userName}>
            {user?.displayName || 'Anonymous'}
          </Text>
            <TouchableOpacity onPress={openProfile}>
              <View style={styles.usernameContainer}>
                <Text style={styles.usernameLink}>
                  @{user?.username || 'unknown'}
                </Text>
                <LinkIcon size={16} color="#3b82f6" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarWrapper}>
            {!imageLoaded && (
              <ActivityIndicator
                size="small"
                color="#3b82f6"
                style={styles.avatarLoader}
              />
            )}

            <Image
              source={
                user?.profilePicture
                  ? { uri: user.profilePicture }
                  : require('@/assets/images/default-profile.png') // fallback local
              }
              style={styles.avatar}
              onLoad={() => setImageLoaded(true)}
            />
          </View>
        </View>
      </View>

      {/* Posts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {currentPosts.map((post, index) => (
            <PostCard
              key={`post-${post.id}-${index}`}
              post={post}
              currentUser={user}
              onDeleted={(deletedId) => {
                setPosts((prevPosts) =>
                  prevPosts.filter((post) => post.id !== deletedId)
                );
              }}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  currentPage === 1 && styles.pageButtonDisabled,
                ]}
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Text style={styles.pageButtonText}>Trước</Text>
              </TouchableOpacity>

              <View style={styles.pageNumbers}>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <TouchableOpacity
                      key={`page-${page}`}
                      style={[
                        styles.pageNumberButton,
                        currentPage === page && styles.pageNumberButtonActive,
                      ]}
                      onPress={() => goToPage(page)}
                    >
                      <Text
                        style={[
                          styles.pageNumberText,
                          currentPage === page && styles.pageNumberTextActive,
                        ]}
                      >
                        {page}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.pageButton,
                  currentPage === totalPages && styles.pageButtonDisabled,
                ]}
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <Text style={styles.pageButtonText}>Sau</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
export default PostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
   
  },
  header: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  usernameLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginRight: 4,
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#fbbf24',
    padding: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  displayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  dotSeparator: {
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  username: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  dateText: {
    fontSize: 10,
    color: '#9ca3af',
    marginLeft: 8,
  },
  captionContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  captionBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  captionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionButtonNormal: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  actionButtonSaved: {
    backgroundColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },
  actionTextNormal: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  actionTextSaved: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dc2626',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  pageNumbers: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  pageNumberButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  pageNumberButtonActive: {
    backgroundColor: '#3b82f6',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  pageNumberTextActive: {
    color: '#fff',
  },
});