import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Preset {
    id?: string | number;
    preset_id?: string;
    icon?: string | number;
    top?: string;
    color_top?: string;
    color_bot?: string;
    color_bottom?: string;
    caption?: string;
    preset_caption?: string;
    color_text?: string;
    text_color?: string;
    type?: string;
}

interface ThemesCustomesProps {
    title?: string;
    presets?: Preset[];
    onSelect: (
        preset_id?: string,
        icon?: string | number,
        color_top?: string,
        color_bottom?: string,
        caption?: string,
        text_color?: string,
        type?: string
    ) => void;
}

const ThemesCustomes: React.FC<ThemesCustomesProps> = ({
    title = "Chọn preset",
    presets = [],
    onSelect
}) => {
    const isLoading = !presets || presets.length === 0;

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <View style={styles.presetsContainer}>
                {isLoading ? (
                    <ActivityIndicator color="orange" size="large" />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {presets.map((preset, index) => {
                            const colorTop = preset.top || preset.color_top || "#000000";
                            const colorBottom = preset.color_bot || preset.color_bottom || colorTop;
                            const textColor = preset.color_text || preset.text_color || "#FFFFFF";
                            const captionTxt = preset.caption || preset.preset_caption || "Caption";
                            const iconDisplay = preset.icon ? (typeof preset.icon === "string" ? preset.icon + " " : "") : "";

                            return (
                                <TouchableOpacity
                                    key={preset.preset_id || preset.id || index.toString()}
                                    onPress={() =>
                                        onSelect(
                                            preset.preset_id,
                                            preset.icon,
                                            preset.top || preset.color_top || "",
                                            preset.color_bot || preset.color_bottom || "",
                                            preset.caption || preset.preset_caption || "",
                                            preset.color_text || preset.text_color || "#FFFFFF",
                                            preset.type
                                        )
                                    }
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={[colorTop, colorBottom]}
                                        style={styles.presetButton}
                                    >
                                        <Text style={[styles.presetText, { color: textColor }]}>
                                            {iconDisplay}{captionTxt}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>
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
        color: "#cecece", // Assuming a dark theme by default
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    presetsContainer: {
        minHeight: 50,
        justifyContent: 'center',
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
    presetText: {
        fontSize: 15,
        fontWeight: "600",
    },
});

export default ThemesCustomes;
