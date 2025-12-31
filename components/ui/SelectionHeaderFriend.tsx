import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6, Feather } from '@expo/vector-icons';
import { Text } from 'react-native';

type Props = {
  friendCount?: number;
  onPressProfile?: () => void;
  onPressMessage?: () => void;
};

const SelectionHeaderFriend = ({
  friendCount = 0,
  onPressProfile,
  onPressMessage,
}: Props) => {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Left */}
      <View style={styles.left}>
        <Pressable style={styles.btnAvatar} onPress={onPressProfile}>
          <Image
            source={require('@/assets/images/default-profile.png')}
            style={styles.avatar}
          />
        </Pressable>
      </View>

      {/* Center */}
      <View style={styles.center}>
        <View style={styles.titleRow}>
          <FontAwesome6 name="user-group" size={16} color="white" />
          <Text style={styles.title}>{friendCount}</Text>
          <Text style={styles.title}>người bạn</Text>
        </View>
      </View>

      {/* Right */}
      <View style={styles.right}>
        <Pressable style={styles.btnMess} onPress={onPressMessage}>
          <Feather name="message-circle" size={28} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SelectionHeaderFriend;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  left: {
    width: 50,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 50,
    alignItems: 'flex-end',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnAvatar: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  btnMess: {
    padding: 4,
  },
});
