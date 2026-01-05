import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCheckAuth } from '@/hooks/useCheckAuth';

export default function Index() {
    const { loading, isAuth } = useCheckAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (isAuth) {
                console.log('🚀 [Index] Authenticated, redirecting to (tabs)...');
                router.replace('/(tabs)');
            } else {
                console.log('🚀 [Index] Not authenticated, redirecting to (auth)/Login...');
                router.replace('/(auth)/Login');
            }
        }
    }, [loading, isAuth]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#3b82f6" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000', // Matching Locket's feel
    },
});
