import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface UimsgProps {
  name: string;
  avatarText: string;
  avatarImage: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  onClick: () => void;
}

const Uimsg: React.FC<UimsgProps> = ({
  name,
  avatarText,
  avatarImage,
  lastMessage,
  time,
  unreadCount,
  onClick,
}) => {
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <TouchableOpacity onPress={onClick} style={styles.container} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {avatarImage ? (
          <Image source={{ uri: avatarImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>
        )}

        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.time}>{formatTime(time)}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {lastMessage || 'Chưa có tin nhắn nào'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#000',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '400',
    flex: 1,
  },
  time: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 8,
  },
  lastMessage: {
    color: '#6b7280',
    fontSize: 14,
  },
});

export default Uimsg;

