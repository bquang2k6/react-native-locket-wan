import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ActivityAvt from './Activity/ActivityAvt';
import ActivityModal from './Activity/ActivityModal';

const { width, height } = Dimensions.get('window');

const ModalSlide = React.memo(({
    item,
    index,
    activeIndex,
    creatorName,
    creatorAvatar,
    onClose,
    renderOverlayIcon,
    reactionInput,
    onReactionInputChange,
    onSendReaction,
    quickEmojis,
    selectedEmoji,
    onDelete,
    isOwner,
    friendDetails,
    user
}: any) => {
    const { colors } = useTheme();
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    return (
        <View style={[styles.modalSlide, { backgroundColor: colors["base-100"] }]}>
            <View style={styles.modalContent}>
                <View style={styles.modalUserHeader}>
                    <Image source={{ uri: creatorAvatar }} style={[styles.modalUserAvatar, { borderColor: colors.primary }]} />
                    <View>
                        <Text style={[styles.modalUserName, { color: colors["base-content"] }]}>{creatorName}</Text>
                        <Text style={[styles.modalUserTime, { color: colors["base-content"], opacity: 0.6 }]}>
                            {new Date(item.date).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                            })}
                        </Text>
                    </View>
                </View>

                <View style={styles.mediaPreviewOuter}>
                    <View style={styles.mediaPreviewContainer}>
                        {item.video_url ? (
                            <Video
                                source={{ uri: item.video_url }}
                                style={styles.mediaPreview}
                                resizeMode={ResizeMode.COVER}
                                shouldPlay={activeIndex === index}
                                isLooping
                            />
                        ) : (
                            <Image
                                source={{ uri: (item.image_url || item.thumbnail_url) as string }}
                                style={styles.mediaPreview}
                                contentFit="cover"
                            />
                        )}

                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>

                        {isOwner && (
                            <TouchableOpacity style={styles.deleteButtonTop} onPress={() => onDelete(item)}>
                                <Feather name="trash-2" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}

                        {item.captions?.[0] && (
                            <View style={styles.captionContainer}>
                                <LinearGradient
                                    colors={item.captions[0].background?.colors?.length >= 2
                                        ? [item.captions[0].background.colors[0], item.captions[0].background.colors[1]]
                                        : ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.6)']}
                                    style={styles.captionBadge}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        {item.captions[0].icon && renderOverlayIcon(item.captions[0].icon)}
                                        <Text style={[styles.captionText, { color: item.captions[0].text_color || '#fff' }]}>
                                            {item.captions[0].caption}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.interactionContainer}>
                    {isOwner ? (
                        <View style={[styles.activityButtonContainer, { backgroundColor: colors["base-300"], borderColor: colors["base-100"] }]}>
                            <TouchableOpacity
                                onPress={() => setIsActivityModalOpen(true)}
                                style={[styles.activityButton, { backgroundColor: colors["base-300"] + "E6" }]}
                            >
                                <Image
                                    source={require('@/assets/images/start.png')}
                                    style={styles.activityIcon}
                                />
                                <Text style={[styles.activityText, { color: colors["base-content"] }]}>Hoạt động</Text>

                                <View style={styles.activityAvtsWrapper}>
                                    <ActivityAvt
                                        momentId={item.id}
                                        friendDetails={friendDetails}
                                        user={user}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[styles.reactionContainer, { borderColor: colors["base-content"], backgroundColor: colors["base-300"] }]}>
                            <TextInput
                                style={styles.reactionInput}
                                placeholder="Nhập icon"
                                placeholderTextColor={colors["base-content"] + "80"}
                                value={activeIndex === index ? reactionInput : ""}
                                onChangeText={onReactionInputChange}
                            />
                            <View style={styles.quickEmojis}>
                                {quickEmojis.slice(0, 4).map((emoji: string) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={[
                                            styles.emojiButton,
                                            (activeIndex === index && (selectedEmoji === emoji || reactionInput === emoji)) && styles.emojiButtonSelected,
                                        ]}
                                        onPress={() => onSendReaction(emoji)}
                                    >
                                        <Text style={styles.emojiText}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={[styles.sendButton, (!reactionInput.trim() || activeIndex !== index) && styles.sendButtonDisabled]}
                                disabled={!reactionInput.trim() || activeIndex !== index}
                                onPress={() => onSendReaction(reactionInput)}
                            >
                                <Feather name="send" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <ActivityModal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                momentId={item.id}
                friendDetails={friendDetails}
                user={user}
            />
        </View >
    );
});

const styles = StyleSheet.create({
    modalSlide: {
        height: height,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width,
        height: height,
        paddingTop: 60,
        alignItems: 'center',
    },
    modalUserHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        width: width - 40,
        paddingHorizontal: 10,
    },
    modalUserAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
    },
    modalUserName: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalUserTime: {
        fontSize: 12,
    },
    mediaPreviewOuter: {
        width: width - 0,
        aspectRatio: 1,
        borderRadius: 40,
        borderWidth: 0,
        overflow: 'hidden',
    },
    mediaPreviewContainer: {
        flex: 1,
    },
    mediaPreview: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    deleteButtonTop: {
        position: 'absolute',
        top: 15,
        left: 15,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captionContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captionBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        maxWidth: '85%',
    },
    captionText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    interactionContainer: {
        width: width - 40,
        marginTop: 30,
    },
    reactionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
        borderRadius: 27,
        paddingHorizontal: 15,
        borderWidth: 1,
    },
    reactionInput: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
    },
    quickEmojis: {
        flexDirection: 'row',
        gap: 4,
    },
    emojiButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    emojiButtonSelected: {
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        transform: [{ scale: 1.1 }],
    },
    emojiText: {
        fontSize: 18,
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: '#333',
        opacity: 0.5,
    },
    activityButtonContainer: {
        width: '100%',
        alignItems: 'center',
        borderRadius: 40,
    },
    activityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        height: 54,
        width: '100%',
    },
    activityIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 10,
    },
    activityText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    activityAvtsWrapper: {
        marginLeft: 'auto',
    }
});

export default ModalSlide;
