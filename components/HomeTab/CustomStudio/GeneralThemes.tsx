import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, Modal, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface GeneralThemesProps {
    title?: string;
    onSelect: (preset: any) => void;
}

const GeneralThemes: React.FC<GeneralThemesProps> = ({ title, onSelect }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedTime = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    const buttons = [
        {
            id: "time",
            icon: <Ionicons name="time" size={24} color="white" />,
            label: formattedTime,
            onPress: () => onSelect({
                preset_id: "image_icon",
                preset_caption: formattedTime,
                type: "time",
            })
        },
        {
            id: "music",
            icon: <Ionicons name="musical-notes" size={24} color="white" />,
            label: "Đang phát",
            onPress: () => {
                // Implement spotify popup if needed
                onSelect({
                    preset_id: "music",
                    preset_caption: "Song Name - Artist",
                    type: "music",
                });
            }
        },
        {
            id: "review",
            icon: <Ionicons name="star" size={24} color="white" />,
            label: "Review",
            onPress: () => {
                onSelect({
                    preset_id: "review",
                    preset_caption: "Great moment!",
                    icon: 5,
                    type: "review",
                });
            }
        },
        {
            id: "location",
            icon: <Ionicons name="location" size={24} color="white" />,
            label: "Vị trí",
            onPress: () => {
                onSelect({
                    preset_id: "location",
                    preset_caption: "Ho Chi Minh City",
                    type: "location",
                });
            }
        },
    ];

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {buttons.map((btn) => (
                    <TouchableOpacity
                        key={btn.id}
                        onPress={btn.onPress}
                        activeOpacity={0.8}
                        style={styles.button}
                    >
                        <View style={styles.contentRow}>
                            {btn.icon}
                            <Text style={styles.buttonText}>{btn.label}</Text>
                        </View>
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
    button: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    buttonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "white",
        marginLeft: 8,
    },
});

export default GeneralThemes;
