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
      console.log('🧪 [Auth] raw user:', userStr);

      if (!userStr) {
        setIsAuth(false);
        return;
      }

      const user = JSON.parse(userStr);
      const idToken = user?.idToken;

      if (!idToken) {
        setIsAuth(false);
        return;
      }

      setIsAuth(true);
      console.log('✅ [Auth] Auth success');
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
