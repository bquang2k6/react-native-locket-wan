import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    ActivityIndicator,
    Image,
    TextInput,
    Alert,
    Pressable,
} from "react-native";
import { X, Palette, Plus } from "lucide-react-native";
import axios from "axios";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";

// Sub-components
import ThemesCustomes from "./ThemesCustomes";
import DevCustomes from "./DevCustomes";
import CaptionIconSelector from "./CaptionIconSelector";
import GeneralThemes from "./GeneralThemes";
import CaptionGifThemes from "./CaptionGifThemes";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface PostOverlay {
    overlay_id?: string;
    type: string;
    icon?: string | number;
    caption?: string;
    color_top?: string;
    color_bottom?: string;
    text_color?: string;
    music?: any;
}

interface CustomStudioModalProps {
    isVisible: boolean;
    onClose: () => void;
    postOverlay: PostOverlay;
    setPostOverlay: (overlay: PostOverlay) => void;
}

const API_BASE = Constants.expoConfig?.extra?.BASE_API_URL_DB || "https://db.locketcamera.com";

const gifList = [
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/0806.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/0808.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/0809.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/2c68009a28d042cd83ae9d9de5587e65.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/48eb4cfdf6bf47eea76d4309a8b301fd.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/8160a7d8756b4952ac99bf91afade11f.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/9168d7c5c4b94e02a2cbc768bacdd199.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/93bd734619674dbbad4d64e9e22dcee6.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/9a2a09c7076942a28f8a6aa9e3672d59.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/9d9477096c204373ad3573c816694b23.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/Happy-Blue-Sky.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/a5eea28dd6c14a1d966a27e5561e99c8.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/b37d4c66ece243d0aeba598c24231612.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/c10d5f2da9584bf09ada65dc3a31264b.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/c7b55f1ac283483092fcaab25dc98515.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/caa0183826944deda599270edcc527c1.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/deadline.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/f9ac1fe6c380428b8a5659b8c5c659d6.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/haha.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/nhang.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/output_no_bg_square.gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/rounded_1013(1).gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/rounded_1013(2).gif",
    "https://raw.githubusercontent.com/bquang2k6/gif/refs/heads/master/rounded_1013.gif"
];

export const CustomStudioModal: React.FC<CustomStudioModalProps> = ({
    isVisible,
    onClose,
    postOverlay,
    setPostOverlay,
}) => {
    const [captionThemes, setCaptionThemes] = useState<any>({
        decorative: [],
        custome: [],
        background: [],
        image_icon: [],
        image_gif: [],
    });
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [showGifModal, setShowGifModal] = useState(false);

    // GIF Selection State
    const [selectedGif, setSelectedGif] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState<string>();
    const [colorBottom, setColorBottom] = useState<string>();
    const [captionText, setCaptionText] = useState("");
    const [textColor, setTextColor] = useState("#FFFFFF");

    useEffect(() => {
        if (isVisible) {
            fetchThemes();
        }
    }, [isVisible]);

    const fetchThemes = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE}/locketpro/themes`);

            const groupThemesByType = (themes: any[]) => {
                const sorted = [...themes].sort((a, b) => (a.order_index ?? 9999) - (b.order_index ?? 9999));
                return {
                    decorative: sorted.filter((t) => t.type === "decorative"),
                    custome: sorted.filter((t) => t.type === "custome"),
                    background: sorted.filter((t) => t.type === "background"),
                    image_icon: sorted.filter((t) => t.type === "image_icon"),
                    image_gif: sorted.filter((t) => t.type === "image_gif"),
                };
            };

            setCaptionThemes(groupThemesByType(data));
        } catch (error) {
            console.error("Lỗi khi fetch themes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (
        preset_id?: string,
        icon?: string | number,
        color_top?: string,
        color_bottom?: string,
        caption?: string,
        text_color?: string,
        type?: string
    ) => {
        setPostOverlay({
            overlay_id: preset_id || "standard",
            color_top: color_top || "",
            color_bottom: color_bottom || "",
            text_color: text_color || "#FFFFFF",
            icon: icon || "",
            caption: caption || "",
            type: type || "default",
        });
        onClose();
    };

    const handleSelectPreset = (preset: any) => {
        const isGif = preset.type === "image_gif";
        setPostOverlay({
            overlay_id: preset.preset_id || "standard",
            color_top: isGif ? "" : (preset.color_top || preset.top || ""),
            color_bottom: isGif ? "" : (preset.color_bottom || preset.color_bot || ""),
            text_color: preset.text_color || preset.color_text || "#FFFFFF",
            icon: preset.icon || "",
            caption: preset.preset_caption || preset.caption || "",
            type: preset.type || "image_link",
        });
        onClose();
    };

    const applyGifCaption = () => {
        if (!selectedGif) {
            Alert.alert("Lỗi", "Vui lòng chọn một GIF trước khi tiếp tục.");
            return;
        }

        setPostOverlay({
            type: "image_gif",
            icon: selectedGif,
            caption: captionText,
            color_top: bgColor,
            color_bottom: colorBottom,
            text_color: textColor,
        });

        setShowGifModal(false);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={[styles.modalContent, { backgroundColor: colors["base-100"] }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleContainer}>
                            <Palette color="#ff5a5f" size={24} />
                            <Text style={styles.headerTitle}>Customize studio</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <X color="#cecece" size={28} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {isLoading ? (
                            <View style={[styles.loadingContainer, { color: colors["base-content"] }]}>
                                <ActivityIndicator size="large" color="#ff5a5f" />
                                <Text style={styles.loadingText}>Đang tải themes...</Text>
                            </View>
                        ) : (
                            <>
                                <ThemesCustomes
                                    title="🎨 Suggest Theme"
                                    presets={captionThemes.background}
                                    onSelect={handleSelect}
                                />
                                <ThemesCustomes
                                    title="🎨 Decorative by Locket"
                                    presets={captionThemes.decorative}
                                    onSelect={handleSelect}
                                />
                                <DevCustomes
                                    onSelect={(id, top, bottom, caption, text) => handleSelect(id, "", top, bottom, caption, text, "custome")}
                                />
                                <CaptionIconSelector
                                    title="🎨 Caption Icon - Truy cập sớm"
                                    captionThemes={captionThemes}
                                    onSelect={handleSelectPreset}
                                />
                                <GeneralThemes
                                    title="🎨 General"
                                    onSelect={handleSelectPreset}
                                />
                                <CaptionGifThemes
                                    title="🎨 Caption Gif - Member"
                                    captionThemes={captionThemes}
                                    onSelect={handleSelectPreset}
                                    extraButton={
                                        <TouchableOpacity
                                            style={styles.addGifButton}
                                            onPress={() => setShowGifModal(true)}
                                        >
                                            <Plus color="white" size={20} />
                                            <Text style={styles.addGifButtonText}>Caption</Text>
                                        </TouchableOpacity>
                                    }
                                />

                                <View style={styles.footerInfo}>
                                    <Text style={styles.footerTitle}>🎨 Caption ? - Sắp ra mắt</Text>
                                    <Text style={styles.footerText}>Phiên bản sắp tới V2.0.8</Text>
                                </View>
                            </>
                        )}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>

            {/* GIF Selection Modal */}
            <Modal
                visible={showGifModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowGifModal(false)}
            >
                <View style={styles.gifModalOverlay}>
                    <View style={[styles.gifModalContent, { backgroundColor: colors["base-100"] }]}>
                        <View style={styles.gifHeader}>
                            <Text style={[styles.gifTitle, { color: colors["base-content"] }]}>Chọn GIF</Text>
                            <TouchableOpacity onPress={() => setShowGifModal(false)}>
                                <X color="#cecece" size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.gifScrollContent}>
                            <Text style={[styles.sectionTitle, { color: colors["base-content"] }]}>Thư viện GIF</Text>
                            <View style={[styles.gifGrid, { backgroundColor: colors["base-200"] }]}>
                                {gifList.map((gif, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => setSelectedGif(gif)}
                                        style={[
                                            styles.gifItem,
                                            selectedGif === gif && styles.selectedGifItem
                                        ]}
                                    >
                                        <Image source={{ uri: gif }} style={styles.gifImage} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.sectionTitle, { color: colors["base-content"] }]}>Tùy chỉnh</Text>
                            {/* <View style={styles.customizationRow}>
                                <View style={styles.colorInputContainer}>
                                    <Text style={[styles.label, { color: colors["base-content"] }]}>Màu nền trên:</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={bgColor}
                                        onChangeText={setBgColor}
                                        placeholder=""
                                        placeholderTextColor="#666"
                                        backgroundColor={colors["base-200"]}
                                    />
                                </View>
                                <View style={styles.colorInputContainer}>
                                    <Text style={[styles.label, { color: colors["base-content"] }]}>Màu nền dưới:</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={colorBottom}
                                        onChangeText={setColorBottom}
                                        placeholder=""
                                        placeholderTextColor="#666"
                                        backgroundColor={colors["base-200"]}
                                    />
                                </View>
                            </View> */}

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors["base-content"] }]}>Caption:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={captionText}
                                    onChangeText={setCaptionText}
                                    placeholder="Nhập caption..."
                                    placeholderTextColor="#666"
                                    backgroundColor={colors["base-200"]}
                                />
                            </View>

                            <View style={styles.colorInputContainer}>
                                <Text style={[styles.label, { color: colors["base-content"] }]}>Màu chữ:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={textColor}
                                    onChangeText={setTextColor}
                                    placeholder="#FFFFFF"
                                    placeholderTextColor="#666"
                                    backgroundColor={colors["base-200"]}
                                />
                            </View>

                            {/* Preview */}
                            <View style={styles.previewContainer}>
                                <LinearGradient
                                    colors={[bgColor ?? "transparent", colorBottom ?? bgColor ?? "transparent",]}
                                    style={styles.previewBox}
                                >
                                    {selectedGif && (
                                        <Image source={{ uri: selectedGif }} style={styles.previewGif} />
                                    )}
                                    <Text style={[styles.previewText, { color: textColor }]}>
                                        {captionText || "Caption Preview"}
                                    </Text>
                                </LinearGradient>

                                <TouchableOpacity style={styles.applyButton} onPress={applyGifCaption}>
                                    <Ionicons name="checkmark" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
};

// Use simple Ionicons for the checkmark if possible, or just standard check mark
const Ionicons = ({ name, size, color }: any) => {
    // Basic fallback for Ionicons
    return <Text style={{ fontSize: size, color }}>✓</Text>;
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#121212",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: SCREEN_HEIGHT * 0.7,
        width: "100%",
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#ffffff",
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        padding: 50,
        alignItems: "center",
    },
    loadingText: {
        color: "#cecece",
        marginTop: 10,
    },
    addGifButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ff5a5f",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginHorizontal: 10,
        gap: 5,
    },
    addGifButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    footerInfo: {
        padding: 20,
        gap: 5,
    },
    footerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ff5a5f",
    },
    footerText: {
        color: "#cecece",
        fontSize: 14,
    },

    // GIF Modal Styles
    gifModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    gifModalContent: {
        backgroundColor: "#181A20",
        width: SCREEN_WIDTH * 0.9,
        maxHeight: SCREEN_HEIGHT * 0.8,
        borderRadius: 20,
        overflow: "hidden",
    },
    gifHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    gifTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ff5a5f",
    },
    gifScrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#cecece",
        marginBottom: 10,
        marginTop: 10,
    },
    gifGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        backgroundColor: "#242731",
        padding: 10,
        borderRadius: 10,
    },
    gifItem: {
        width: (SCREEN_WIDTH * 0.8 - 65) / 4,
        aspectRatio: 1,
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedGifItem: {
        borderColor: "#ff5a5f",
        transform: [{ scale: 1.1 }],
    },
    gifImage: {
        width: "100%",
        height: "100%",
    },
    customizationRow: {
        flexDirection: "row",
        gap: 10,
    },
    inputContainer: {
        marginBottom: 15,
    },
    colorInputContainer: {
        flex: 1,
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: "#aaa",
        marginBottom: 5,
    },
    textInput: {
        backgroundColor: "#242731",
        color: "white",
        padding: 10,
        borderRadius: 8,
        fontSize: 14,
    },
    previewContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        gap: 15,
    },
    previewBox: {
        width: 200,
        height: 45,
        borderRadius: 22,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        overflow: "hidden",
        borderWidth: 1,
    },
    previewGif: {
        width: 30,
        height: 30,
        borderRadius: 4,
        marginRight: 10,
    },
    previewText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    applyButton: {
        backgroundColor: "#4CAF50",
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: "center",
        alignItems: "center",
    },
});
