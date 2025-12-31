import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Uimsg from './Uimsg';

interface Message {
  uid: string;
  name: string;
  avatarText: string;
  avatarImage: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

interface ListmsgProps {
  messages: Message[];
  onSelect: (msg: Message) => void;
  loading: boolean;
}

const Listmsg: React.FC<ListmsgProps> = ({ messages, onSelect, loading }) => {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.uid}
      renderItem={({ item }) => (
        <Uimsg
          name={item.name}
          avatarText={item.avatarText}
          avatarImage={item.avatarImage}
          lastMessage={item.lastMessage}
          time={item.time}
          unreadCount={item.unreadCount}
          onClick={() => onSelect(item)}
        />
      )}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
});

export default Listmsg;
