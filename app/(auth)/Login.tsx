import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, initializeApiUrl } from '@/hooks/api'; // 🔥 chỉnh lại path cho đúng project bạn
import { useEffect } from 'react';




const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
    useEffect(() => {
    const loadRemember = async () => {
        const remember = await AsyncStorage.getItem('rememberMe');
        const savedEmail = await AsyncStorage.getItem('rememberEmail');

        if (remember === 'true' && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
        } else {
        setRememberMe(false);
        }
    };

    loadRemember();
    }, []);

  const handleLogin = async () => {
    console.log('🟢 [Login] Press login');

    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);

    try {
      console.log('🟡 [Login] Init API URL...');
      await initializeApiUrl();
      console.log('🟢 [Login] API_URL:', API_URL.LOGIN_URL.toString());

      console.log('🟡 [Login] Sending request...');
      const res = await fetch(API_URL.LOGIN_URL.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🟡 [Login] Response status:', res.status);

      if (!res.ok) {
        const text = await res.text();
        console.log('🔴 [Login] Response error text:', text);
        throw new Error(text || 'Đăng nhập thất bại');
      }

      const data = await res.json();
      console.log('🟢 [Login] Response data:', data);

      // 🔐 Lưu cache
      console.log('🟡 [Login] Saving to AsyncStorage...');
      await AsyncStorage.multiSet([
        ['idToken', data.idToken ?? ''],
        ['refreshToken', data.refreshToken ?? ''],
        ['localId', data.uid || data.localId || ''],
        ['user', JSON.stringify(data)],
      ]);

    if (rememberMe) {
        await AsyncStorage.multiSet([
            ['rememberMe', 'true'],
            ['rememberEmail', email],
        ]);
    } else {
        await AsyncStorage.multiRemove(['rememberMe', 'rememberEmail']);
    }

      // 🔍 Verify lại storage
      const verifyToken = await AsyncStorage.getItem('idToken');
      const verifyUser = await AsyncStorage.getItem('user');

      console.log('🧪 [Login] Verify idToken:', verifyToken);
      console.log('🧪 [Login] Verify user:', verifyUser);

      console.log('🚀 [Login] Redirecting to (tabs)...');
      router.replace('/(tabs)');

    } catch (err: any) {
      console.error('🔴 [Login] Error:', err);
      Alert.alert(
        'Đăng nhập thất bại',
        err?.message || 'Không thể kết nối tới server'
      );
    } finally {
      setLoading(false);
      console.log('🔵 [Login] Done');
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Đăng Nhập Locket</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Đăng Nhập</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.hint}>Vui lòng chờ các Node khởi động.</Text>

              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Server Status</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  button: {
    width: '100%',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});

export default LoginScreen;