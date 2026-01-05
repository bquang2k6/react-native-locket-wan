import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import { API_URL } from "@/hooks/api";

const DonateHistory = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { colors } = useTheme();

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL.DONATE_URL}`);
            setDonations(res.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi khi fetch donations:", err);
            setError("Không thể tải dữ liệu donate. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors["base-content"] }]}>
                    Đang tải...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={[styles.errorTitle, { color: colors.error }]}>
                    Có lỗi xảy ra!
                </Text>
                <Text style={[styles.errorMessage, { color: colors["base-content"] + "80" }]}>
                    {error}
                </Text>
                <TouchableOpacity
                    onPress={fetchDonations}
                    style={[styles.retryButton, { backgroundColor: colors.primary }]}
                >
                    <Text style={[styles.retryButtonText, { color: colors["base-100"] }]}>
                        Thử lại
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (donations.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🎁</Text>
                <Text style={[styles.emptyText, { color: colors["base-content"] }]}>
                    Chưa có ai ủng hộ dự án này
                </Text>
                <Text style={[styles.emptySubtext, { color: colors["base-content"] + "60" }]}>
                    Hãy là người đầu tiên ủng hộ nhé! 💖
                </Text>
            </View>
        );
    }

    return (
        <View>
            <View style={styles.historyHeader}>
                <Text style={styles.historyEmoji}>🎁</Text>
                <Text style={[styles.historyTitle, { color: colors.primary }]}>
                    Lịch sử ủng hộ
                </Text>
                <Text style={styles.historyEmoji}>❤️</Text>
            </View>

            <View style={styles.donationsList}>
                {donations.map((donation) => (
                    <View
                        key={donation.id}
                        style={[styles.donationCard, { backgroundColor: colors["base-200"] }]}
                    >
                        <View style={styles.donationContent}>
                            <View style={styles.donorInfo}>
                                <View style={[styles.donorAvatar, { backgroundColor: colors.primary }]}>
                                    <Text style={[styles.donorInitial, { color: colors["base-100"] }]}>
                                        {donation.donorname.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.donorDetails}>
                                    <Text style={[styles.donorName, { color: colors["base-content"] }]}>
                                        {donation.donorname}
                                    </Text>
                                    <Text style={[styles.donationDate, { color: colors["base-content"] + "80" }]}>
                                        {formatDate(donation.date)}
                                    </Text>
                                </View>
                            </View>

                            {donation.message && (
                                <View style={[styles.messageBox, { backgroundColor: colors["base-300"] }]}>
                                    <Text style={[styles.messageText, { color: colors["base-content"] }]}>
                                        "{donation.message}"
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={[styles.amountBox, { backgroundColor: colors.success + "20" }]}>
                            <Text style={[styles.amountText, { color: colors.success }]}>
                                {formatAmount(donation.amount)}
                            </Text>
                            <Text style={[styles.amountLabel, { color: colors.success }]}>
                                Ủng hộ
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Total */}
                <View style={[styles.totalCard, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.totalLabel, { color: colors["base-content"] }]}>
                        Tổng số tiền đã nhận được:
                    </Text>
                    <Text style={[styles.totalAmount, { color: colors.primary }]}>
                        {formatAmount(donations.reduce((total, d) => total + d.amount, 0))}
                    </Text>
                    <View style={styles.totalFooter}>
                        <Text style={styles.totalEmoji}>❤️</Text>
                        <Text style={[styles.totalText, { color: colors["base-content"] }]}>
                            Cảm ơn {donations.length} người ủng hộ!
                        </Text>
                        <Text style={styles.totalEmoji}>✨</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const DonationInfo = () => {
    const BankAccount = "088907XXXX";
    const BankName = "MB Bank, Momo";
    const BankAccountName = "Phạm Bá Quang";

    return {
        BankAccount,
        BankName,
        BankAccountName,
    };
};

const AboutMe = () => {
    const { colors } = useTheme();
    const router = useRouter();
    const bankinfor = DonationInfo();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    }, []);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors["base-100"] }]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors["base-content"]} />
                </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
                        <Image
                            source={require("@/assets/images/default-profile.png")}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={[styles.badge1, { backgroundColor: colors.warning }]}>
                        <Text style={styles.badgeText}>✨</Text>
                    </View>
                    <View style={[styles.badge2, { backgroundColor: colors.secondary }]}>
                        <Text style={styles.badgeText}>⭐</Text>
                    </View>
                </View>

                <Text style={[styles.name, { color: colors.primary }]}>
                    Phạm Bá Quang
                </Text>
                <View style={styles.subtitle}>
                    <Text style={styles.musicEmoji}>🎵</Text>
                    <Text style={[styles.subtitleText, { color: colors["base-content"] }]}>
                        I love Music
                    </Text>
                    <Text style={styles.musicEmoji}>✨</Text>
                </View>

                <View style={styles.techIcons}>
                    <Text style={styles.techIcon}>⚛️</Text>
                    <Text style={styles.techIcon}>🎨</Text>
                    <Text style={styles.techIcon}>📗</Text>
                    <Text style={styles.techIcon}>▲</Text>
                </View>
            </View>

            {/* Support Card */}
            <View style={[styles.supportCard, { backgroundColor: colors["base-200"] }]}>
                <View style={styles.supportHeader}>
                    <Text style={styles.supportEmoji}>☕</Text>
                    <Text style={[styles.supportTitle, { color: colors["base-content"] }]}>
                        Hỗ trợ dự án này
                    </Text>
                    <Text style={styles.supportEmoji}>❤️</Text>
                </View>
                <Text style={[styles.supportSubtitle, { color: colors["base-content"] + "80" }]}>
                    Mỗi sự ủng hộ của bạn đều có ý nghĩa đặc biệt! 💖
                </Text>

                {/* QR Code */}
                <View style={styles.qrSection}>
                    <View style={[styles.qrContainer, { backgroundColor: colors["base-100"] }]}>
                        <Image
                            source={require("@/assets/images/banking-infor.png")}
                            style={styles.qrImage}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={[styles.qrLabel, { backgroundColor: colors.warning + "20" }]}>
                        <Text style={styles.qrEmoji}>☕</Text>
                        <Text style={[styles.qrText, { color: colors.warning }]}>
                            Buy me a coffee
                        </Text>
                        <Text style={styles.qrEmoji}>☕</Text>
                    </View>
                    <Text style={[styles.qrSubtext, { color: colors["base-content"] + "80" }]}>
                        Quét mã QR để ủng hộ nhanh chóng
                    </Text>
                </View>

                {/* Bank Info */}
                <View style={styles.bankInfo}>
                    <View style={styles.bankInfoHeader}>
                        <Text style={styles.bankEmoji}>💳</Text>
                        <Text style={[styles.bankInfoTitle, { color: colors["base-content"] }]}>
                            Thông tin chuyển khoản
                        </Text>
                        <Text style={[styles.bankEmoji, { color: colors.primary }]}>✨</Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: colors["base-100"] }]}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoEmoji}>📱</Text>
                            <Text style={[styles.infoLabel, { color: colors["base-content"] }]}>
                                Số tài khoản:
                            </Text>
                        </View>
                        <Text style={[styles.infoValue, { color: colors.primary }]}>
                            {bankinfor.BankAccount}
                        </Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: colors["base-100"] }]}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoEmoji}>👤</Text>
                            <Text style={[styles.infoLabel, { color: colors["base-content"] }]}>
                                Tên tài khoản:
                            </Text>
                        </View>
                        <Text style={[styles.infoValue, { color: colors.secondary }]}>
                            {bankinfor.BankAccountName}
                        </Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: colors["base-100"] }]}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoEmoji}>🏦</Text>
                            <Text style={[styles.infoLabel, { color: colors["base-content"] }]}>
                                Ngân hàng:
                            </Text>
                        </View>
                        <Text style={[styles.infoValue, { color: colors.info }]}>
                            {bankinfor.BankName}
                        </Text>
                    </View>

                    <View style={[styles.thankYouBox, { backgroundColor: colors.primary + "20" }]}>
                        <View style={styles.thankYouRow}>
                            <Text style={styles.thankYouEmoji}>🎁</Text>
                            <View style={styles.thankYouContent}>
                                <View style={styles.thankYouHeader}>
                                    <Text style={[styles.thankYouTitle, { color: colors["base-content"] }]}>
                                        ✨ Cảm ơn bạn rất nhiều!
                                    </Text>
                                    <Text style={styles.thankYouEmoji}>❤️</Text>
                                </View>
                                <Text style={[styles.thankYouText, { color: colors["base-content"] }]}>
                                    Sự ủng hộ của bạn giúp duy trì và phát triển dự án này.
                                    Mỗi đóng góp, dù nhỏ hay lớn, đều có ý nghĩa đặc biệt với chúng tôi! 💖
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Donate History */}
            <View style={[styles.historyCard, { backgroundColor: colors["base-200"] }]}>
                <DonateHistory />
            </View>

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 20,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 20,
    },
    avatarRing: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        overflow: "hidden",
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    badge1: {
        position: "absolute",
        top: -8,
        right: -8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    badge2: {
        position: "absolute",
        bottom: -4,
        left: -4,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        fontSize: 16,
    },
    name: {
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    musicEmoji: {
        fontSize: 20,
    },
    subtitleText: {
        fontSize: 18,
        fontWeight: "500",
    },
    techIcons: {
        flexDirection: "row",
        gap: 16,
    },
    techIcon: {
        fontSize: 24,
    },
    supportCard: {
        marginHorizontal: 16,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
    },
    supportHeader: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    supportEmoji: {
        fontSize: 32,
    },
    supportTitle: {
        fontSize: 28,
        fontWeight: "bold",
    },
    supportSubtitle: {
        textAlign: "center",
        fontSize: 16,
        marginBottom: 24,
    },
    qrSection: {
        alignItems: "center",
        marginBottom: 32,
    },
    qrContainer: {
        width: 280,
        height: 280,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    qrImage: {
        width: "100%",
        height: "100%",
    },
    qrLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        marginBottom: 8,
    },
    qrEmoji: {
        fontSize: 20,
    },
    qrText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    qrSubtext: {
        fontSize: 14,
        textAlign: "center",
    },
    bankInfo: {
        gap: 12,
    },
    bankInfoHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    bankEmoji: {
        fontSize: 24,
    },
    bankInfoTitle: {
        fontSize: 22,
        fontWeight: "bold",
    },
    infoCard: {
        borderRadius: 16,
        padding: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    infoEmoji: {
        fontSize: 20,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "monospace",
    },
    thankYouBox: {
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
    },
    thankYouRow: {
        flexDirection: "row",
        gap: 12,
    },
    thankYouEmoji: {
        fontSize: 20,
        marginTop: 2,
    },
    thankYouContent: {
        flex: 1,
    },
    thankYouHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    thankYouTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    thankYouText: {
        fontSize: 14,
        lineHeight: 20,
    },
    historyCard: {
        marginHorizontal: 16,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
    },
    historyHeader: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
    },
    historyEmoji: {
        fontSize: 32,
    },
    historyTitle: {
        fontSize: 26,
        fontWeight: "bold",
    },
    donationsList: {
        gap: 16,
    },
    donationCard: {
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    donationContent: {
        gap: 12,
    },
    donorInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    donorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    donorInitial: {
        fontSize: 20,
        fontWeight: "bold",
    },
    donorDetails: {
        flex: 1,
    },
    donorName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    donationDate: {
        fontSize: 12,
    },
    messageBox: {
        borderRadius: 12,
        padding: 12,
    },
    messageText: {
        fontSize: 14,
        fontStyle: "italic",
        lineHeight: 20,
    },
    amountBox: {
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
    },
    amountText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
    },
    amountLabel: {
        fontSize: 12,
        fontWeight: "600",
    },
    totalCard: {
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 12,
    },
    totalFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    totalEmoji: {
        fontSize: 18,
    },
    totalText: {
        fontSize: 14,
        fontWeight: "500",
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    errorEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default AboutMe;