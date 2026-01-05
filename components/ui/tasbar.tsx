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
  Megaphone,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface TaskbarProps {
  goToPage: (pageKey: string) => void;
  goToPageVertical: (pageKey: string) => void;
}

import { useTheme } from '@/context/ThemeContext';

export default function LiquidGlassTaskbar({ goToPage, goToPageVertical }: TaskbarProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const { colors } = useTheme();

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
    { id: 'RollCall', label: 'Roll Call', icon: Megaphone, action: () => goToPageVertical('rollcall') }
  ];

  const sidebarSections = [
    {
      title: 'Ứng dụng',
      items: [
        { id: 'Palette', label: 'Cài đặt giao diện', icon: Palette, href: '/theme' },
        { id: 'Package', label: 'Quản lý gói đăng ký', icon: Package, href: '/upgrade' },
        { id: 'Setting', label: 'Cài đặt', icon: Settings, action: () => router.push('/settings') },
      ],
    },
    {
      title: 'Hồ sơ',
      items: [
        { id: 'User', label: 'Hồ sơ', icon: User, href: '/profile' },

      ],
    },
    {
      title: 'Về Locket Wan',
      items: [
        { id: 'Camera', label: 'Quyền riêng tư', icon: Camera, href: '/docs' },
        { id: 'History', label: 'Lịch sử hình thành', icon: History, href: '/timeline' },
        { id: 'AlertCircle', label: 'Gửi đề xuất / Báo lỗi', icon: AlertCircle, href: 'https://wangtech.top' },
        { id: 'Gift', label: 'Ủng hộ dự án', icon: Gift, href: '  ' },
      ],
    },
    {
      title: 'Nguy hiểm',
      danger: true,
      items: [
        { id: 'logout', label: 'Đăng xuất', icon: LogOut, action: handleLogout },
      ],
    },
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
          <View style={[styles.sidebarContainer, { backgroundColor: 'transparent' }]}>
            <TouchableOpacity activeOpacity={1} style={[
              styles.sidebarContent,
              {
                backgroundColor: colors["base-100"], // Use base-100 for sidebar background
                borderColor: colors["base-300"]
              }
            ]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sidebarInner}>
                  {sidebarSections.map((section) => (
                    <View key={section.title} style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: colors["base-content"] }]}>{section.title}</Text>

                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isDanger = section.danger;
                        const itemColor = isDanger ? colors.error : colors["base-content"];

                        return (
                          <TouchableOpacity
                            key={item.id}
                            style={[styles.sidebarItem]}
                            onPress={() => {
                              if (item.action) item.action();
                              else if (item.href) {
                                router.push(item.href as any);
                                setShowSidebar(false);
                              }
                            }}
                          >
                            <Icon size={18} color={itemColor} />
                            <Text style={[
                              styles.sidebarItemText,
                              { color: itemColor }
                            ]}>
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
                {/* Footer */}
                <View style={[styles.sidebarFooter, { borderTopColor: colors["base-300"] }]}>
                  <Text style={[styles.footerText, { color: colors["base-content"] }]}>Version 1.0.0</Text>
                  <Text style={[styles.footerCopyright, { color: colors.primary }]}>© 2025 Locket Wan</Text>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Taskbar */}
      <View style={styles.taskbarContainer}>
        <View style={[
          styles.taskbar,
          {
            backgroundColor: colors["base-200"], // Taskbar background
            borderColor: colors["base-300"],
            opacity: 0.95
          }
        ]}>
          <View style={styles.taskbarInner}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeItem === item.id;
              const iconColor = active ? colors.primary : colors["neutral"];

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
                    color={iconColor}
                    strokeWidth={1.6}
                  />
                  <Text style={[
                    styles.taskbarLabel,
                    { color: iconColor }
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
              <Menu size={22} color={colors["neutral"]} strokeWidth={1.6} />
              <Text style={[styles.taskbarLabel, { color: colors["neutral"] }]}>Danh mục</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.59)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
  },
  sidebarInner: {
    gap: 4,
    marginTop: 30,
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
    color: '#ffffffff',
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
  // Footer
  sidebarFooter: {
    padding: 24,
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.1)',
  },
  footerText: {
    fontSize: 11,
    color: '#ffffffff',
    fontWeight: '500',
  },
  footerCopyright: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffffff',
    marginBottom: 6,
    marginLeft: 8,
    textTransform: 'uppercase',
  },

});