import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Preset {
    id: string | number;
    preset_id?: string;
    icon: string;
    color_top?: string;
    top?: string;
    color_bottom?: string;
    color_bot?: string;
    text_color?: string;
    color_text?: string;
    preset_caption?: string;
    type?: string;
}

interface CaptionIconSelectorProps {
    title?: string;
    captionThemes: {
        image_icon: Preset[];
    };
    onSelect: (preset: Preset) => void;
}

const CaptionIconSelector: React.FC<CaptionIconSelectorProps> = ({
    title,
    captionThemes,
    onSelect,
}) => {
    if (!captionThemes?.image_icon) return null;

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {captionThemes.image_icon.map((preset) => {
                    const colorTop = preset.top || preset.color_top || "#000000";
                    const colorBottom = preset.color_bot || preset.color_bottom || colorTop;
                    const textColor = preset.color_text || preset.text_color || "#FFFFFF";

                    return (
                        <TouchableOpacity
                            key={preset.id}
                            onPress={() => onSelect(preset)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[colorTop, colorBottom]}
                                style={styles.presetButton}
                            >
                                <View style={styles.contentRow}>
                                    <Image source={{ uri: preset.icon }} style={styles.icon} />
                                    <Text style={[styles.presetText, { color: textColor }]}>
                                        {preset.preset_caption || "Caption"}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        width: '100%',
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#cecece",
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingHorizontal: 12,
        gap: 8,
    },
    presetButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    presetText: {
        fontSize: 15,
        fontWeight: "600",
    },
});

export default CaptionIconSelector;
