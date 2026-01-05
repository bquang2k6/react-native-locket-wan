import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEMES } from '@/constants/themeDefinitions';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { ArrowLeft } from "lucide-react-native";

const { width } = Dimensions.get('window');
// Calculate card width for 2 columns with padding
const CARD_WIDTH = (width - 48) / 2;

export default function ThemeSelectionScreen() {
    const { themeName, setTheme, availableThemes, colors } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors["base-100"] }]} edges={['top']}>
            <Stack.Screen
                options={{ headerShown: false }}
            />


            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ fontSize: 24, marginBottom: 5, color: colors["base-content"] }}>←</Text>
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: colors["base-content"] }]}>
                    Custom Theme
                </Text>

                <View style={{ width: 240 }} />
            </View>


            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: colors["base-content"] }]}>🎨 Chọn Giao Diện</Text>

                <View style={styles.grid}>
                    {availableThemes.map((t) => {
                        const themeColors = THEMES[t];
                        const isActive = themeName === t;

                        return (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.card,
                                    { backgroundColor: themeColors["base-100"], borderColor: themeColors["base-300"] },
                                    isActive && { borderColor: themeColors.primary, borderWidth: 2, opacity: 0.8 }
                                ]}
                                onPress={() => setTheme(t)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.preview, { borderColor: themeColors["base-300"] }]}>
                                    {/* Left sidebar simulation */}
                                    <View style={[styles.previewSidebar, { backgroundColor: themeColors["base-200"] }]} />
                                    {/* Content area */}
                                    <View style={styles.previewContent}>
                                        <Text style={[styles.themeName, { color: themeColors["base-content"] }]}>{t}</Text>
                                        <View style={styles.colorRow}>
                                            <View style={[styles.colorDot, { backgroundColor: themeColors.primary }]}>
                                                <Text style={{ fontSize: 6, color: themeColors["base-100"], fontWeight: 'bold' }}>A</Text>
                                            </View>
                                            <View style={[styles.colorDot, { backgroundColor: themeColors.secondary }]}>
                                                <Text style={{ fontSize: 6, color: themeColors["base-100"], fontWeight: 'bold' }}>A</Text>
                                            </View>
                                            <View style={[styles.colorDot, { backgroundColor: themeColors.accent }]}>
                                                <Text style={{ fontSize: 6, color: themeColors["base-100"], fontWeight: 'bold' }}>A</Text>
                                            </View>
                                            <View style={[styles.colorDot, { backgroundColor: themeColors.neutral }]}>
                                                <Text style={{ fontSize: 6, color: colors["base-100"], fontWeight: 'bold' }}>A</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    card: {
        width: CARD_WIDTH,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    preview: {
        flex: 1,
        flexDirection: 'row',
    },
    previewSidebar: {
        width: '20%',
        height: '100%',
    },
    previewContent: {
        flex: 1,
        padding: 8,
        justifyContent: 'center',
        gap: 4,
    },
    themeName: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    colorRow: {
        flexDirection: 'row',
        gap: 4,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
    },

});
