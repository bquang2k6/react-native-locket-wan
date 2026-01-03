import React, { useState } from 'react';
import { useRouter, router } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import {
  Send,
  History,
  MessageCircle,
  Menu,
  User,
  LogOut,
  Palette,
  Package,
  Settings,
  AlertCircle,
  Gift,
  Camera,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MegaphoneIcon = () => (
  <Svg width={21} height={21} fill="currentColor" viewBox="0 0 16 16">
    <Path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-.214c-2.162-1.241-4.49-1.843-6.912-2.083l.405 2.712A1 1 0 0 1 5.51 15.1h-.548a1 1 0 0 1-.916-.599l-1.85-3.49-.202-.003A2.014 2.014 0 0 1 0 9V7a2.02 2.02 0 0 1 1.992-2.013 75 75 0 0 0 2.483-.075c3.043-.154 6.148-.849 8.525-2.199zm1 0v11a.5.5 0 0 0 1 0v-11a.5.5 0 0 0-1 0m-1 1.35c-2.344 1.205-5.209 1.842-8 2.033v4.233q.27.015.537.036c2.568.189 5.093.744 7.463 1.993zm-9 6.215v-4.13a95 95 0 0 1-1.992.052A1.02 1.02 0 0 0 1 7v2c0 .55.448 1.002 1.006 1.009A61 61 0 0 1 4 10.065m-.657.975 1.609 3.037.01.024h.548l-.002-.014-.443-2.966a68 68 0 0 0-1.722-.082z" />
  </Svg>
);
interface TaskbarProps {
  goToPage: (pageKey: string) => void;
  goToPageVertical: (pageKey: string) => void;
}

export default function LiquidGlassTaskbar({ goToPage, goToPageVertical }: TaskbarProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const handleLogout = async () => {
    console.log('🔴 [Logout] start');

    await AsyncStorage.multiRemove([
      'idToken',
      'refreshToken',
      'localId',
      'user',
      'cached_friends',
    ]);

    console.log('🔴 [Logout] storage cleared');

    // 🔥 báo cho RootLayout biết
    DeviceEventEmitter.emit('AUTH_CHANGED');

    // Chuyển hướng về trang login
    try {
      const { router } = require('expo-router');
      router.replace('/(auth)/Login');
    } catch (e) {
      console.error('Logout navigation error:', e);
    }
  };


  const menuItems = [
    { id: 'home', label: 'Trang Chủ', icon: Send, action: () => goToPageVertical('main') },
    { id: 'history', label: 'Lịch sử', icon: History, action: () => goToPageVertical('history') },
    { id: 'chat', label: 'Chat', icon: MessageCircle, action: () => goToPage('messages') },
    { id: 'RollCall', label: 'Roll Call', icon: MegaphoneIcon, action: () => goToPageVertical('rollcall') }
  ];

  const sidebarItems = [
    { id: 'Palette', label: 'Cài đặt giao diện', icon: Palette, href: '/theme' },
    { id: 'Setting', label: 'Cài đặt', icon: Settings, href: '/settings' },
    { id: 'Package', label: 'Quản lý gói đăng ký', icon: Package, href: '/upgrade' },
    { id: 'User', label: 'Hồ sơ', icon: User, href: '/profile' },
    { id: 'MdOutlineUpdate', label: 'Cập nhật lên bản mới', icon: Package, href: '/cache' },
    { id: 'AlertCircle', label: 'Gửi đề xuất, Báo cáo sự cố', icon: AlertCircle, href: 'https://wangtech.top' },
    { id: 'History', label: 'Lịch sử hình thành', icon: History, href: '/timeline' },
    { id: 'Gift', label: 'Ủng hộ dự án', icon: Gift, href: '/aboutme' },
    { id: 'Camera', label: 'Quyền riêng tư', icon: Camera, href: '/docs' },
    { id: 'logout', label: 'Đăng xuất', icon: LogOut, action: handleLogout },
  ];

  return (
    <>
      {/* Sidebar Modal */}
      <Modal
        visible={showSidebar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSidebar(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowSidebar(false)}
        >
          <View style={styles.sidebarContainer}>
            <TouchableOpacity activeOpacity={1} style={styles.sidebarContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sidebarInner}>
                  {sidebarItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <React.Fragment key={item.id}>
                        {index === 9 && <View style={styles.divider} />}
                        <TouchableOpacity
                          style={[
                            styles.sidebarItem,
                            item.id === 'logout' && styles.logoutItem
                          ]}
                          onPress={() => {
                            if (item.action) {
                              item.action();
                            } else if (item.href) {
                              router.push(item.href as any);
                              setShowSidebar(false);
                            }
                          }}

                        >
                          <Icon size={18} color={item.id === 'logout' ? '#ef4444' : '#000'} />
                          <Text style={[
                            styles.sidebarItemText,
                            item.id === 'logout' && styles.logoutText
                          ]}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      </React.Fragment>
                    );
                  })}
                </View>
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Taskbar */}
      <View style={styles.taskbarContainer}>
        <View style={styles.taskbar}>
          <View style={styles.taskbarInner}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeItem === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.taskbarButton}
                  onPress={() => {
                    setActiveItem(item.id);
                    item.action?.();
                  }}
                >
                  <Icon
                    size={22}
                    color={active ? '#3b82f6' : 'rgba(0,0,0,0.7)'}
                    strokeWidth={1.6}
                  />
                  <Text style={[
                    styles.taskbarLabel,
                    active && styles.taskbarLabelActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Menu button */}
            <TouchableOpacity
              style={styles.taskbarButton}
              onPress={() => setShowSidebar(true)}
            >
              <Menu size={22} color="rgba(0,0,0,0.7)" strokeWidth={1.6} />
              <Text style={styles.taskbarLabel}>Danh mục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sidebarContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: Math.min(320, width * 0.85),
    padding: 16,
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
  },
  sidebarInner: {
    gap: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  sidebarItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  logoutItem: {
    backgroundColor: 'transparent',
  },
  logoutText: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  taskbarContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 30,
  },
  taskbar: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  taskbarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskbarButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 12,
  },
  taskbarLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.7)',
  },
  taskbarLabelActive: {
    color: '#3b82f6',
  },
});