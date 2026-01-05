import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Listmsg from './components/Listmsg';
import SocketStatus from './components/SocketStatus';
import {
  GetAllMessage,
  getMessagesWithUser,
  sendMessage as sendMessageService,
  markReadMessage,
  sendReactionOnMessage,
} from '@/hooks/services/chatService';
import {
  getSocket,
  onNewListMessages,
  onNewMessagesWithUser,
  emitGetListMessages,
  emitGetMessagesWithUser,
} from '@/hooks/socket';
import { useTheme } from '@/context/ThemeContext';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  create_time?: number;
  createdAt?: number;
  created_at?: number;
  timestamp?: number;
  reply_moment?: string;
  thumbnail_url?: string;
  reactions?: Array<{ emoji: string; sender: string }>;
}

interface SelectedChat {
  uid: string;
  name: string;
  avatarText: string;
  avatarImage: string;
  withUser: string;
}

interface Conversation {
  uid: string;
  with_user: string;
  latestMessage?: {
    body: string;
    createdAt: number;
  };
  unreadCount?: number;
  sender?: string;
  updateTime?: number;
  update_time?: number;
}

export default function ChatListPage() {
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lastEnterTime, setLastEnterTime] = useState(0);
  const [activeReactionMsg, setActiveReactionMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<ScrollView>(null);
  const pressTimerRef = useRef<number | null>(null);
  const [friendDetails, setFriendDetails] = useState<any[]>([]);
  const userCacheRef = useRef<Map<string, any>>(new Map()); // Cache user info to avoid re-fetching
  const { colors } = useTheme();

  // Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };
    loadUser();
  }, []);

  // Load friends for name/avatar resolution
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsStr = await AsyncStorage.getItem('cached_friends'); // Changed from 'friendDetails'
        console.log('👥 Raw friendDetails from storage:', friendsStr ? 'Found' : 'Not found');

        if (friendsStr) {
          const friends = JSON.parse(friendsStr);
          setFriendDetails(friends);
          console.log('👥 Loaded friends:', friends.length);
          // console.log('👥 First friend:', friends[0]);
        } else {
          console.log('⚠️ No friendDetails in AsyncStorage');
        }
      } catch (err) {
        console.error('Error loading friends:', err);
      }
    };
    loadFriends();
  }, []);

  // Monitor socket connection
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    };

    const handleConnectError = (error: any) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    };

    setIsConnected(socket.connected);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  // Fetch conversation list
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('idToken');
        if (!token) throw new Error('Chưa đăng nhập. Vui lòng đăng nhập lại.');

        console.log('📨 Fetching conversations...');
        const conversations = await GetAllMessage();
        // console.log('📨 Raw conversations from API:', conversations);

        if (conversations?.length > 0) {
          // Fetch user details for each conversation (with caching)
          const transformedMessages = await Promise.all(
            conversations.map(async (item: Conversation) => {
              let userName = 'Người dùng';
              let avatarUrl = '/prvlocket.png';

              // Check cache first
              if (userCacheRef.current.has(item.with_user)) {
                const cachedUser = userCacheRef.current.get(item.with_user);
                userName = cachedUser.name;
                avatarUrl = cachedUser.avatar;
                // console.log('💾 Using cached user:', item.with_user, '→', userName);
              } else {
                try {
                  // Fetch user details from API
                  const userRes = await axios.post(
                    'https://api.locketcamera.com/fetchUserV2',
                    {
                      data: {
                        user_uid: item.with_user,
                      },
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );

                  const userData = userRes?.data?.result?.data;
                  if (userData) {
                    userName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                      userData.username ||
                      'Người dùng';
                    avatarUrl = userData.profile_picture_url || '/prvlocket.png';

                    // Cache the user info
                    userCacheRef.current.set(item.with_user, {
                      name: userName,
                      avatar: avatarUrl,
                    });

                    // console.log('👤 Fetched user:', item.with_user, '→', userName);
                  }
                } catch (err) {
                  console.log('⚠️ Failed to fetch user:', item.with_user);
                  userName = item.with_user;
                }
              }

              return {
                uid: item.uid,
                name: userName,
                avatarText: userName.substring(0, 2).toUpperCase(),
                avatarImage: avatarUrl,
                lastMessage: item.latestMessage?.body || '',
                time: String(item.latestMessage?.createdAt || item.updateTime || item.update_time || Date.now()),
                unreadCount: item.unreadCount || 0,
                sender: item.sender,
                withUser: item.with_user,
              };
            })
          );

          transformedMessages.sort((a: any, b: any) => parseInt(b.time) - parseInt(a.time));
          console.log('📨 Transformed messages:', transformedMessages.length, 'items');
          console.log('📨 First message:', transformedMessages[0]);
          setMessages(transformedMessages);
        } else {
          console.log('📨 No conversations returned from API');
          setMessages([]);
        }
      } catch (err: any) {
        console.error('❌ Fetch messages error:', err);
        console.error('❌ Error details:', err.response?.data || err.message);
        Alert.alert('Lỗi', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Subscribe to real-time conversation list updates
  useEffect(() => {
    const token = AsyncStorage.getItem('idToken');
    if (!token) return;

    const handleNewConversations = (data: Conversation[]) => {
      if (!Array.isArray(data) || !data.length) return;

      const transformed = data.map((item) => {
        const userName = item.with_user || 'Người dùng';
        return {
          uid: item.uid,
          name: userName,
          avatarText: userName.substring(0, 2).toUpperCase(),
          avatarImage: '/prvlocket.png',
          lastMessage: item.latestMessage?.body || '',
          time: String(item.latestMessage?.createdAt || item.updateTime || item.update_time || Date.now()),
          unreadCount: item.unreadCount || 0,
          sender: item.sender,
          withUser: item.with_user,
        };
      });

      setMessages((prev) => {
        const merged = [...prev];
        transformed.forEach((newItem) => {
          const existingIndex = merged.findIndex((m) => m.uid === newItem.uid);
          if (existingIndex >= 0) {
            merged[existingIndex] = newItem;
          } else {
            merged.push(newItem);
          }
        });
        return merged.sort((a, b) => parseInt(b.time) - parseInt(a.time));
      });
    };

    const off = onNewListMessages(handleNewConversations);

    token.then((t) => {
      if (t) emitGetListMessages({ timestamp: null, token: t });
    });

    const socket = getSocket();
    const onReconnect = () => {
      token.then((t) => {
        if (t) emitGetListMessages({ timestamp: null, token: t });
      });
    };
    socket.on('connect', onReconnect);

    return () => {
      off?.();
      socket.off('connect', onReconnect);
    };
  }, []);

  // Fetch chat detail when a chat is selected
  useEffect(() => {
    const fetchChatDetail = async () => {
      if (!selectedChat) return;
      try {
        setLoadingChat(true);
        setAvatarError(false);

        const messages = await getMessagesWithUser(selectedChat.uid, null);

        if (messages?.length > 0) {
          setChatMessages(messages.reverse());
        } else {
          setChatMessages([]);
        }
      } catch (err) {
        console.error('❌ Fetch chat detail error:', err);
      } finally {
        setLoadingChat(false);
      }
    };

    fetchChatDetail();
  }, [selectedChat]);

  // Mark messages as read
  useEffect(() => {
    if (!selectedChat) return;
    const markAsRead = async () => {
      try {
        await markReadMessage(selectedChat.uid);
      } catch (err) {
        console.error('Lỗi markAsRead:', err);
      }
    };

    markAsRead();
  }, [selectedChat]);

  // Subscribe to real-time messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const token = AsyncStorage.getItem('idToken');
    if (!token) return;

    const handleNewMessages = (updatedMessages: ChatMessage[]) => {
      if (Array.isArray(updatedMessages)) {
        setChatMessages(updatedMessages);
      }
    };

    const off = onNewMessagesWithUser(handleNewMessages);

    token.then((t) => {
      if (t) {
        emitGetMessagesWithUser({
          messageId: selectedChat.uid,
          timestamp: null,
          token: t,
        });
      }
    });

    const socket = getSocket();
    const onReconnect = () => {
      token.then((t) => {
        if (t) {
          emitGetMessagesWithUser({
            messageId: selectedChat.uid,
            timestamp: null,
            token: t,
          });
        }
      });
    };
    socket.on('connect', onReconnect);

    return () => {
      off?.();
      socket.off('connect', onReconnect);
    };
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      const messageData = {
        receiver_uid: selectedChat.withUser,
        message: newMessage.trim(),
        moment_id: null,
      };

      const result = await sendMessageService(messageData);

      if (result?.result?.status === 200 || result?.data) {
        const newMsgObj: ChatMessage = {
          id: result.data?.id || String(Date.now()),
          text: newMessage.trim(),
          sender: user?.uid || user?.localId || '',
          createdAt: Date.now() / 1000,
          create_time: Date.now() / 1000,
        };

        setChatMessages((prev) => [...prev, newMsgObj]);
        setNewMessage('');
      } else {
        throw new Error('Send message failed');
      }
    } catch (err) {
      console.error('Send message error:', err);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };

  const handleKeyDown = (text: string) => {
    // For React Native, we'll handle double-enter differently
    // This is a simplified version - you may want to add a send button instead
    setNewMessage(text);
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    try {
      if (!selectedChat?.uid) {
        console.error('Không có conversation_id hợp lệ');
        return;
      }

      const result = await sendReactionOnMessage({
        messageId,
        emoji,
        conversationId: selectedChat.uid,
      });

      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
              ...m,
              reactions: result?.data?.reactions || m.reactions || [],
            }
            : m
        )
      );
    } catch (err) {
      console.error('Lỗi khi gửi reaction:', err);
    }
  };

  const formatMessageTime = (rawTimestamp: any) => {
    if (!rawTimestamp) return '';
    const numericTimestamp = Number(rawTimestamp);
    const toMillis = numericTimestamp < 1e12 ? numericTimestamp * 1000 : numericTimestamp;
    if (isNaN(toMillis)) return '';
    return new Date(toMillis).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Debug: Log when messages state changes
  useEffect(() => {
    console.log('📋 Messages state changed:', messages.length, 'items');
  }, [messages]);

  // Debug: Log when selectedChat changes
  useEffect(() => {
    console.log('💬 Selected chat changed:', selectedChat ? selectedChat.name : 'null (list view)');
  }, [selectedChat]);

  if (!selectedChat) {
    return (
      <View style={[styles.container, { backgroundColor: colors["base-100"] }]}>
        <View style={[styles.header, { backgroundColor: colors["base-200"], borderBottomColor: colors["base-300"] }]}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}></Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors["base-content"] }]}>Tin nhắn</Text>
          <SocketStatus isConnected={isConnected} />
        </View>
        <Listmsg messages={messages} onSelect={(msg) => setSelectedChat(msg as any as SelectedChat)} loading={loading} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors["base-100"] }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.chatHeader, { backgroundColor: colors["base-200"], borderBottomColor: colors["base-300"] }]}>
        <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.chatBackButton}>
          <Text style={[styles.backText, { color: colors["base-content"] }]}>←</Text>
        </TouchableOpacity>
        {selectedChat.avatarImage && !avatarError ? (
          <Image
            source={{ uri: selectedChat.avatarImage }}
            style={styles.chatAvatar}
            onError={() => setAvatarError(true)}
          />
        ) : (
          <View style={[styles.chatAvatarPlaceholder, { backgroundColor: colors["base-100"] }]}>
            <Text style={[styles.chatAvatarText, { color: colors["base-content"] }]}>{selectedChat.avatarText || 'U'}</Text>
          </View>
        )}
        <Text style={[styles.chatName, { color: colors["base-content"] }]}>{selectedChat.name || 'Người dùng'}</Text>
      </View>

      <ScrollView
        ref={messagesEndRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => {
          messagesEndRef.current?.scrollToEnd({ animated: false });
        }}
      >
        {loadingChat ? (
          <Text style={[styles.loadingText, { color: colors["base-content"] }]}>Đang tải tin nhắn...</Text>
        ) : (
          chatMessages.map((msg) => {
            const isOwn = msg.sender === (user?.uid || user?.localId);
            const formattedTime = formatMessageTime(
              msg.create_time ?? msg.created_at ?? msg.timestamp
            );

            return (
              <View
                key={msg.id}
                style={[styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther]}
                onTouchStart={() => {
                  pressTimerRef.current = setTimeout(() => {
                    setActiveReactionMsg(msg.id);
                  }, 1000) as any as number;
                }}
                onTouchEnd={() => {
                  if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
                }}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isOwn
                      ? [styles.messageBubbleOwn, { backgroundColor: colors.primary }]
                      : [styles.messageBubbleOther, { backgroundColor: colors["base-300"] }],
                  ]}
                >
                  {msg.reply_moment && (
                    <Text style={[styles.replyText, { color: isOwn ? colors["base-100"] : colors["base-content"] }]}>↪ {msg.reply_moment}</Text>
                  )}

                  {msg.thumbnail_url && (
                    <Image source={{ uri: msg.thumbnail_url }} style={styles.thumbnail} />
                  )}

                  <Text style={[styles.messageText, { color: isOwn ? colors["base-100"] : colors["base-content"] }]}>{msg.text}</Text>

                  {msg.reactions && msg.reactions.length > 0 && (
                    <View style={styles.reactionsContainer}>
                      {msg.reactions.map((r, i) => (
                        <Text key={i} style={styles.reactionEmoji}>
                          {r.emoji}
                        </Text>
                      ))}
                    </View>
                  )}

                  {activeReactionMsg === msg.id && (
                    <View style={[styles.reactionPopup, { backgroundColor: colors["base-200"] }]}>
                      {['👍', '❤️', '😂', '😮', '😢', '🔥', '😍'].map((emo) => (
                        <TouchableOpacity
                          key={emo}
                          onPress={() => {
                            handleReactMessage(msg.id, emo);
                            setActiveReactionMsg(null);
                          }}
                          style={styles.emojiButton}
                        >
                          <Text style={styles.emojiButtonText}>{emo}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                {formattedTime && <Text style={styles.messageTime}>{formattedTime}</Text>}
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: colors["base-200"], borderTopColor: colors["base-300"] }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors["base-100"], borderColor: colors["base-300"], color: colors["base-content"] }]}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors["base-content"] + "80"}
          value={newMessage}
          onChangeText={handleKeyDown}
          multiline
        />
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={handleSendMessage}>
          <Text style={[styles.sendButtonText, { color: colors["base-100"] }]}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 6,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  chatBackButton: {
    marginRight: 12,
    padding: 8,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  chatName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  messageRow: {
    marginBottom: 12,
  },
  messageRowOwn: {
    alignItems: 'flex-end',
  },
  messageRowOther: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    position: 'relative',
  },
  messageBubbleOwn: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#374151',
    borderBottomLeftRadius: 4,
  },
  replyText: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    marginBottom: 4,
    color: '#fff',
  },
  thumbnail: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginVertical: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  reactionPopup: {
    position: 'absolute',
    top: -40,
    left: '50%',
    transform: [{ translateX: -100 }],
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emojiButton: {
    padding: 4,
  },
  emojiButtonText: {
    fontSize: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  input: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});