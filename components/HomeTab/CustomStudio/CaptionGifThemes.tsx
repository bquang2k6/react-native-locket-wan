import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";

interface Preset {
    id: string | number;
    preset_id?: string;
    icon: string;
    preset_caption?: string;
    color_top?: string;
    color_bottom?: string;
    text_color?: string;
    type?: string;
}

interface CaptionGifThemesProps {
    title?: string;
    captionThemes: {
        image_gif?: Preset[];
    };
    onSelect: (preset: Preset) => void;
    extraButton?: React.ReactNode;
}

const CaptionGifThemes: React.FC<CaptionGifThemesProps> = ({
    title,
    captionThemes,
    onSelect,
    extraButton,
}) => {
    const gifPresets = captionThemes?.image_gif || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                <View style={styles.badge}><Text style={styles.badgeText}>New</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {gifPresets.map((preset) => (
                    <TouchableOpacity
                        key={preset.id}
                        onPress={() => onSelect(preset)}
                        activeOpacity={0.8}
                        style={styles.presetButton}
                    >
                        <View style={styles.contentRow}>
                            <Image source={{ uri: preset.icon }} style={styles.icon} />
                            <Text style={styles.presetText}>
                                {preset.preset_caption || "Caption"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
                {extraButton}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        width: '100%',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        paddingHorizontal: 16,
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#cecece",
    },
    badge: {
        backgroundColor: "#ff5a5f",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    scrollContent: {
        paddingHorizontal: 12,
        gap: 8,
    },
    presetButton: {
        backgroundColor: "#181A20",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#333",
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 8,
        borderRadius: 4,
    },
    presetText: {
        fontSize: 15,
        fontWeight: "600",
        color: "white",
    },
});

export default CaptionGifThemes;
