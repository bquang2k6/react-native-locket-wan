import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SocketStatusProps {
  isConnected: boolean;
}

const SocketStatus: React.FC<SocketStatusProps> = ({ isConnected }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, isConnected ? styles.dotConnected : styles.dotDisconnected]} />
      <Text style={[styles.text, isConnected ? styles.textConnected : styles.textDisconnected]}>
        {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: '#22c55e',
  },
  dotDisconnected: {
    backgroundColor: '#ef4444',
  },
  text: {
    fontSize: 14,
  },
  textConnected: {
    color: '#16a34a',
  },
  textDisconnected: {
    color: '#dc2626',
  },
});

export default SocketStatus;

