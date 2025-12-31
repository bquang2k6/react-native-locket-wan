import React, { useState } from 'react';
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
} from 'react-native';
import Listmsg from './components/Listmsg';
import SocketStatus from './components/SocketStatus';

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

export default function ChatListPage() {
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    console.log('Send message:', newMessage);
    // TODO: Implement send message logic
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

  if (!selectedChat) {
    // Danh sách tin nhắn
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tin nhắn</Text>
          <SocketStatus isConnected={isConnected} />
        </View>
        <Listmsg messages={messages} onSelect={setSelectedChat} loading={loading} />
      </View>
    );
  }

  // Chi tiết chat
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.chatBackButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        {selectedChat.avatarImage && !avatarError ? (
          <Image
            source={{ uri: selectedChat.avatarImage }}
            style={styles.chatAvatar}
            onError={() => setAvatarError(true)}
          />
        ) : (
          <View style={styles.chatAvatarPlaceholder}>
            <Text style={styles.chatAvatarText}>{selectedChat.avatarText || 'U'}</Text>
          </View>
        )}
        <Text style={styles.chatName}>{selectedChat.name || 'Người dùng'}</Text>
      </View>

      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {loadingChat ? (
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        ) : (
          chatMessages.map((msg) => {
            const isOwn = msg.sender === 'current_user_uid'; // TODO: Replace with actual user ID
            const formattedTime = formatMessageTime(
              msg.create_time ?? msg.createdAt ?? msg.created_at ?? msg.timestamp
            );

            return (
              <View
                key={msg.id}
                style={[styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
                  ]}
                >
                  {msg.reply_moment && (
                    <Text style={styles.replyText}>↪ {msg.reply_moment}</Text>
                  )}

                  {msg.thumbnail_url && (
                    <Image source={{ uri: msg.thumbnail_url }} style={styles.thumbnail} />
                  )}

                  <Text style={styles.messageText}>{msg.text}</Text>

                  {msg.reactions && msg.reactions.length > 0 && (
                    <View style={styles.reactionsContainer}>
                      {msg.reactions.map((r, i) => (
                        <Text key={i} style={styles.reactionEmoji}>
                          {r.emoji}
                        </Text>
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

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Gửi</Text>
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