// App.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Pressable, ActivityIndicator } from 'react-native';
import { RefreshCw } from "lucide-react-native";
import { useExpoUpdate } from "../../hooks/useExpoUpdate";
import { useTheme } from "@/context/ThemeContext";

export default function Settings() {
    const { isChecking, isDownloading, checkForUpdates } = useExpoUpdate();

    const loading = isChecking || isDownloading;
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors["base-100"] }]}>
            <Pressable
                style={styles.updateBtn}
                disabled={loading}
                onPress={() => checkForUpdates(true)}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <RefreshCw size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.updateText}>Kiểm tra cập nhật</Text>
                    </>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fdf2f8",
    },
    updateBtn: {
        backgroundColor: "#7c3aed",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
    },
    updateText: {
        color: "#fff",
        fontWeight: "600",
    },
});
