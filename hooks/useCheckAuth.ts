import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export function useCheckAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const checkAuth = async () => {
    console.log('🚀 [Auth] checking auth');

    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        setIsAuth(false);
        return;
      }

      // 🔄 Kiểm tra và làm mới token nếu cần
      const { checkAndRefreshIdToken } = require('./tokenManager');
      const validToken = await checkAndRefreshIdToken();

      if (!validToken) {
        setIsAuth(false);
        return;
      }

      setIsAuth(true);
      console.log('✅ [Auth] Xác thực thành công với mã thông báo hợp lệ/đã được làm mới.');
    } catch (e) {
      console.error('❌ [Auth] Error:', e);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const sub = DeviceEventEmitter.addListener(
      'AUTH_CHANGED',
      checkAuth
    );

    return () => sub.remove();
  }, []);

  return { loading, isAuth };
}
