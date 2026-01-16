import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
} from "react-native";
import { ChevronDown, Info } from "lucide-react-native";

const formatPrice = (price) =>
    price === 0 ? "Miễn phí" : `${price.toLocaleString()}đ`;

const plans = [
    {
        id: "free",
        name: "Miễn phí",
        price: 0,
        duration_days: 0,
        color: "#6b7280",
        perks: {
            "Upload ảnh 5MB": true,
            "Upload video 10MB": true,
            "Tính năng cơ bản": true,
        },
        has_trial_offer: false,
    },
    {
        id: "basic",
        name: "Cơ bản",
        price: 50000,
        duration_days: 30,
        color: "#3b82f6",
        perks: {
            "Upload ảnh 10MB": true,
            "Upload video 50MB": true,
            "Tùy chỉnh theme": true,
            "Không quảng cáo": true,
        },
        has_trial_offer: true,
    },
    {
        id: "premium",
        name: "Cao cấp",
        price: 150000,
        duration_days: 90,
        color: "#8b5cf6",
        perks: {
            "Upload ảnh 20MB": true,
            "Upload video 100MB": true,
            "Tùy chỉnh theme": true,
            "Không quảng cáo": true,
            "Ưu tiên hỗ trợ": true,
        },
        has_trial_offer: true,
    },
    {
        id: "vip",
        name: "VIP",
        price: 500000,
        duration_days: 365,
        color: "#f59e0b",
        perks: {
            "Upload ảnh không giới hạn": true,
            "Upload video không giới hạn": true,
            "Tùy chỉnh theme": true,
            "Không quảng cáo": true,
            "Ưu tiên hỗ trợ": true,
            "Tính năng độc quyền": true,
        },
        has_trial_offer: false,
    },
];

export default function RegisterMemberPage() {
    const [expanded, setExpanded] = useState(false);

    const user = { displayName: "Người dùng mẫu" };

    const userPlan = {
        plan_id: "basic",
        plan_info: {
            name: "Cơ bản",
        },
        end_date: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
    };

    const remainingDays = userPlan?.end_date
        ? Math.ceil(
            (new Date(userPlan.end_date) - new Date()) /
            (1000 * 60 * 60 * 24)
        )
        : null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.title}>Đăng ký thành viên Locket Wan</Text>

            {/* Intro */}
            <Pressable
                style={styles.introButton}
                onPress={() => setExpanded(!expanded)}
            >
                <Info size={16} color="#2563eb" />
                <Text style={styles.introText}>
                    {expanded ? "Thu gọn" : "Giới thiệu về gói thành viên"}
                </Text>
                <ChevronDown
                    size={16}
                    style={{
                        transform: [{ rotate: expanded ? "180deg" : "0deg" }],
                    }}
                />
            </Pressable>

            {expanded && (
                <View style={styles.introBox}>
                    <Text style={styles.paragraph}>
                        Gói thành viên <Text style={styles.bold}>Locket Wan</Text> mang đến
                        trải nghiệm đầy đủ: đăng ảnh, video, tùy chỉnh theme và nhiều tiện
                        ích độc quyền.
                    </Text>
                    <Text style={styles.paragraph}>
                        100% doanh thu được tái đầu tư vào hạ tầng và phát triển tính năng.
                    </Text>
                    <Text style={[styles.paragraph, styles.italic]}>
                        Cảm ơn bạn đã ủng hộ 💖
                    </Text>
                </View>
            )}

            {/* Current plan */}
            {userPlan && (
                <View style={styles.currentPlan}>
                    <Text style={styles.sectionTitle}>✨ Gói hiện tại</Text>

                    <InfoRow label="Tên" value={user.displayName} />
                    <InfoRow label="Gói" value={userPlan.plan_info.name} />
                    <InfoRow
                        label="Còn lại"
                        value={remainingDays > 0 ? `${remainingDays} ngày` : "Hết hạn"}
                    />
                </View>
            )}

            {/* Plans */}
            <View style={{ marginTop: 16 }}>
                {plans.map((plan) => {
                    const active = userPlan?.plan_id === plan.id;

                    return (
                        <View
                            key={plan.id}
                            style={[
                                styles.planCard,
                                active && { borderColor: "#8b5cf6", borderWidth: 2 },
                            ]}
                        >
                            <Text style={[styles.planName, { color: plan.color }]}>
                                {plan.name}
                            </Text>

                            <Text style={styles.price}>{formatPrice(plan.price)}</Text>

                            <Text style={styles.duration}>
                                {plan.duration_days
                                    ? `Hiệu lực ${plan.duration_days} ngày`
                                    : "Miễn phí"}
                            </Text>

                            {Object.keys(plan.perks).map((perk) => (
                                <Text key={perk} style={styles.perk}>
                                    ✔ {perk}
                                </Text>
                            ))}

                            <Pressable
                                style={[
                                    styles.selectBtn,
                                    active && { backgroundColor: "#9ca3af" },
                                ]}
                                disabled={active}
                            >
                                <Text style={styles.selectText}>
                                    {active
                                        ? "Đang sử dụng"
                                        : plan.price === 0
                                            ? "Bắt đầu miễn phí"
                                            : "Chọn gói"}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

/* ================= STYLES ================= */

function InfoRow({ label, value }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fdf2f8",
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 12,
        color: "#1f2937",
    },
    introButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginBottom: 8,
    },
    introText: {
        color: "#2563eb",
        fontWeight: "500",
    },
    introBox: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 14,
        color: "#374151",
        marginBottom: 6,
    },
    bold: { fontWeight: "700" },
    italic: { fontStyle: "italic", color: "#6b7280" },

    currentPlan: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
        color: "#7c3aed",
    },
    row: {
        flexDirection: "row",
        marginVertical: 2,
    },
    label: {
        width: 80,
        fontWeight: "500",
        color: "#6b7280",
    },
    value: {
        color: "#111827",
    },
    planCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    planName: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    price: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        marginVertical: 4,
    },
    duration: {
        textAlign: "center",
        color: "#6b7280",
        marginBottom: 6,
    },
    perk: {
        fontSize: 14,
        color: "#374151",
    },
    selectBtn: {
        marginTop: 10,
        backgroundColor: "#6d28d9",
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
    },
    selectText: {
        color: "#fff",
        fontWeight: "600",
    },
});
