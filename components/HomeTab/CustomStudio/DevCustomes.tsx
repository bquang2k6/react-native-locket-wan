import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface DevCustomesProps {
    onSelect: (
        id: string,
        top: string,
        bottom: string,
        caption: string,
        text: string
    ) => void;
}

const DevCustomes: React.FC<DevCustomesProps> = ({ onSelect }) => {
    const customePresets = [
        { id: "locket_times", top: "#FFDEE9", bottom: "#B5FFFC", caption: "📸 Locket Time!", text: "#202020E6" },
        { id: "snake_vibes", top: "#A8E063", bottom: "#56AB2F", caption: "🐍 Snake Vibes", text: "#1F1F1FE6" },
        { id: "coffee_time", top: "#4B2C20", bottom: "#B48E72", caption: "☕ Coffee Time!", text: "#FFFFFFE6" },
        { id: "feeling_cute", top: "#FF6A88", bottom: "#FFB199", caption: "🌷 Feeling Cute", text: "#FFFFFFE6" },
        { id: "sunset_vibes", top: "#FF758C", bottom: "#FF7EB3", caption: "🌇 Sunset Vibes", text: "#FFFFFFE6" },
        { id: "flight_times", top: "#2196f3", bottom: "#6dd5ed", caption: "🛫 Flight Time!", text: "#FFFFFFE6" },
        { id: "photo_times", top: "#F7BB97", bottom: "#DD5E89", caption: "📷 Photo Time!", text: "#FFFFFFE6" },
        { id: "day_dream", top: "#FAD0C4", bottom: "#FFD1FF", caption: "🌤 Daydream", text: "#101010E6" },
        { id: "mixue_times", top: "#E0F7FA", bottom: "#FFCDD2", caption: "🍦 Mixue Time!", text: "#4E0000E6" }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎨 New Custome by Wan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {customePresets.map((custome) => (
                    <TouchableOpacity
                        key={custome.id}
                        onPress={() =>
                            onSelect(custome.id, custome.top, custome.bottom, custome.caption, custome.text)
                        }
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[custome.bottom, custome.top]} // Note: Original was to top, so bottom first
                            style={styles.presetButton}
                        >
                            <Text style={[styles.presetText, { color: custome.text }]}>
                                {custome.caption}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
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
    presetText: {
        fontSize: 15,
        fontWeight: "600",
    },
});

export default DevCustomes;
