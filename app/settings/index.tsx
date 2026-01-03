// App.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

export default function App() {
    const [count, setCount] = useState(0);

    const handlePress = () => {
        setCount(count + 1);
        Alert.alert('Bạn đã nhấn nút!', `Số lần nhấn: ${count + 1}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chào mừng đến với React Native!</Text>
            <Button title="Nhấn tôi" onPress={handlePress} />
            <Text style={styles.counter}>Số lần nhấn: {count}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    counter: {
        marginTop: 20,
        fontSize: 18,
        color: '#333',
    },
});
