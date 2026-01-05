import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const Docs = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.spacer} />
            <Text style={styles.title}>
                Hướng Dẫn Sử Dụng Trang Web Locket Wan
            </Text>

            <View style={styles.content}>
                {/* Giới Thiệu */}
                <Text style={styles.heading}>1. Giới Thiệu Về Locket Wan</Text>
                <Text style={styles.paragraph}>
                    Locket Wan là nền tảng WebApp giúp bạn dễ dàng tải lên, lưu trữ và
                    chia sẻ ảnh, video với phong cách riêng biệt qua các caption tùy
                    chỉnh. Chúng tôi cam kết mang đến cho bạn trải nghiệm quản lý nội dung
                    thuận tiện, bảo mật và tối ưu nhất trên web.
                </Text>

                {/* Tính Năng Chính */}
                <Text style={styles.heading}>2. Tính Năng Chính</Text>
                <View style={styles.list}>
                    <Text style={styles.listItem}>• Đăng nhập vào hệ thống với bảo mật nâng cao.</Text>
                    <Text style={styles.listItem}>• Tải ảnh và video lên Locket.</Text>
                    <Text style={styles.listItem}>• Tùy chỉnh caption theo ý thích.</Text>
                    <Text style={styles.listItem}>• Chọn bạn bè có thể xem khi đăng.</Text>
                    <Text style={styles.listItem}>• Forums chia sẻ màu caption.</Text>
                    <Text style={styles.listItem}>• Quay video hoặc chụp ảnh trực tiếp trên web.</Text>
                    <Text style={styles.listItem}>• Tùy chỉnh backend cho người dùng nâng cao.</Text>
                    <Text style={styles.listItem}>
                        • Tăng chất lượng ảnh/video <Text style={styles.secondary}>(coming soon)</Text>.
                    </Text>
                </View>

                {/* Các Lưu Ý Quan Trọng */}
                <Text style={styles.heading}>3. Các Lưu Ý Quan Trọng</Text>
                <View style={styles.list}>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Kích thước tệp:</Text> Đối với ảnh nhỏ hơn 1MB và video có thể có
                        kích thước tối đa 10MB.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Định dạng hỗ trợ:</Text> Ảnh: JPG, JPEG; Video: MP4, MOV.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Kích cỡ phương tiện:</Text> Sau khi tải lên web phương tiện sẽ tự
                        động được cắt vuông. Vì vậy bạn nên cắt vuông trước khi tải lên.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Quyền riêng tư:</Text> Các tệp tin tải lên sẽ được bảo mật, nhưng
                        hãy chắc chắn rằng bạn không chia sẻ thông tin nhạy cảm.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Cài đặt Backend:</Text> Người dùng nâng cao có thể tùy chỉnh URL backend
                        và encryption key trong phần cài đặt. URL phải bắt đầu bằng https://.
                    </Text>
                </View>

                {/* Hướng Dẫn Khi Lỗi Tải Ảnh/Video */}
                <Text style={styles.heading}>4. Hướng Dẫn Khi Gặp Lỗi Tải Ảnh/Video</Text>
                <Text style={styles.paragraph}>
                    Nếu bạn gặp lỗi khi tải ảnh hoặc video lên trang web, có thể do kích
                    thước tệp quá lớn hoặc định dạng không được hỗ trợ.
                </Text>
                <Text style={styles.paragraph}>
                    Để giải quyết vấn đề này, bạn có thể thực hiện các bước sau:
                </Text>
                <View style={styles.list}>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Bước 1:</Text> Kiểm tra kích thước tệp và đảm bảo ảnh
                        không vượt quá 10MB và video không quá 25MB.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Bước 2:</Text> Nếu tệp quá lớn, hãy thử nén ảnh hoặc video
                        bằng cách gửi chúng qua Zalo, Messenger, hoặc bất kỳ ứng dụng nhắn
                        tin nào.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Bước 3:</Text> Sau khi gửi, tải lại ảnh/video đã được lưu
                        về từ ứng dụng đó.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Bước 4:</Text> Cuối cùng, thử tải lại ảnh hoặc video lên
                        trang web.
                    </Text>
                </View>
                <Text style={styles.paragraph}>
                    Đây là cách nhanh chóng và hiệu quả để giảm kích thước tệp mà không
                    cần sử dụng công cụ nén bên ngoài.
                </Text>

                {/* Câu Hỏi Thường Gặp (FAQ) */}
                <Text style={styles.heading}>5. Câu Hỏi Thường Gặp (FAQ)</Text>
                <View style={styles.list}>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Có thể xóa ảnh/video đã tải lên không?</Text> Có. Bạn có thể xoá
                        ảnh/video đã đăng bất kỳ lúc nào từ màn hình chính bằng cách nhấn
                        giữ và chọn nút xoá.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Tôi có thể tùy chỉnh backend không?</Text> Có, người dùng nâng cao có thể
                        tùy chỉnh URL backend và encryption key trong phần cài đặt. URL phải bắt
                        đầu bằng https:// và encryption key phải được cung cấp chính xác.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Gói thành viên là gì?</Text> Gói thành viên là các gói dịch vụ giúp
                        người dùng mở khóa thêm nhiều tính năng như đăng nhiều ảnh/video
                        hơn, lưu trữ nhiều hơn, và hỗ trợ tùy chỉnh cá nhân hóa tốt hơn.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Làm sao để nâng cấp gói thành viên?</Text> Vào thanh toán thui, khi thanh toán xong,
                        chờ vài giây xong ấn làm mới gói, và gói của bạn đã được kích hoạt
                        trong trường hợp đã thanh toán mà không thấy gói được kích hoạt, liên hệ tui qua{" "}
                        <Text style={styles.secondary}>https://discord.gg/7JDAEp8Mgt</Text>
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Trang web hỗ trợ các trình duyệt nào?</Text> Locket Wan hỗ trợ tất
                        cả các trình duyệt hiện đại như Chrome, Firefox, Safari, Edge và
                        trình duyệt di động Android/iOS.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Thông tin người dùng có được lưu lại không?</Text> Trang web sẽ thu
                        thập và lưu trữ một số thông tin cơ bản như email, tên và tên đăng
                        nhập (username) để xác thực tài khoản và đảm bảo an toàn cho người
                        dùng. Chúng tôi cam kết sử dụng thông tin này một cách nghiêm túc,
                        không chia sẻ với bên thứ ba và chỉ dùng để hỗ trợ quản lý tài khoản
                        cũng như nâng cao trải nghiệm của bạn.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Tôi có thể xem lại những ảnh/video đã đăng không?</Text> Có. Các bài
                        đã đăng được lưu trong mục lịch sử đăng (Recent Posts), bạn có thể
                        xem lại và xoá bất kỳ lúc nào.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Trang web có quảng cáo không?</Text> Không. Locket Wan hoạt động
                        hoàn toàn không có quảng cáo để giữ trải nghiệm người dùng liền mạch và
                        sạch sẽ.
                    </Text>
                    <Text style={styles.listItem}>
                        • <Text style={styles.bold}>Tại sao nên ủng hộ gói thành viên?</Text> 100% thu nhập từ các gói
                        được sử dụng để vận hành máy chủ, bảo trì, và phát triển thêm tính
                        năng mới. Việc bạn ủng hộ là động lực to lớn để dự án phát triển bền
                        vững.
                    </Text>
                </View>

                {/* Cam Đoan Bảo Mật */}
                <Text style={styles.heading}>6. Chính Sách Bảo Mật</Text>
                <Text style={styles.paragraph}>
                    Locket Wan cam kết bảo mật thông tin tài khoản của bạn. Tất cả các tệp
                    tin và dữ liệu mà bạn tải lên sẽ được bảo vệ bằng các biện pháp an
                    toàn cao cấp. Chúng tôi không lưu trữ bất kỳ thông tin nhạy cảm nào và
                    luôn nỗ lực để đảm bảo rằng các thông tin cá nhân và tài khoản của bạn
                    được bảo vệ một cách an toàn nhất.
                </Text>

                {/* Liên Hệ */}
                <Text style={styles.heading}>7. Liên Hệ</Text>
                <Text style={[styles.paragraph, styles.strikethrough]}>
                    Nếu bạn có bất kỳ câu hỏi hoặc vấn đề gì, vui lòng liên hệ với chúng tôi
                    thông qua mục hỗ trợ trong ứng dụng.
                </Text>
            </View>
            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    spacer: {
        height: 64,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    content: {
        maxWidth: 768,
        alignSelf: 'center',
        width: '100%',
        marginBottom: 48,
    },
    heading: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8,
    },
    list: {
        marginLeft: 0,
        marginBottom: 8,
    },
    listItem: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8,
    },
    bold: {
        fontWeight: '700',
    },
    secondary: {
        color: '#8b5cf6',
    },
    strikethrough: {
        textDecorationLine: 'line-through',
    },
    bottomSpacer: {
        height: 40,
    },
});

export default Docs;