import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useCheckAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🚀 [Auth] App started → checking auth');

      try {
        const userStr = await AsyncStorage.getItem('user');
        console.log('🧪 [Auth] raw user:', userStr);

        if (!userStr) {
          console.warn('❌ [Auth] No user in storage');
          setIsAuth(false);
          return;
        }

        const user = JSON.parse(userStr);
        const idToken = user?.idToken;

        console.log('🧪 [Auth] idToken from user:', idToken);

        if (!idToken) {
          console.warn('❌ [Auth] user exists but idToken missing');
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

    checkAuth();
  }, []);

  return { loading, isAuth };
}
