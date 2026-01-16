# Hướng dẫn sử dụng Expo Updates (EAS Update)

Dự án của bạn đã được cấu hình sẵn `expo-updates`. Dưới đây là cách bạn có thể đẩy các bản cập nhật Over-the-Air (OTA) cho người dùng mà không cần thông qua App Store/Play Store (đối với các thay đổi về JS/Assets).

## 1. Chuẩn bị

Trước hết, bạn cần cài đặt EAS CLI và đăng nhập:

```bash
npm install -g eas-cli
eas login
```

## 2. Quy trình đẩy bản cập nhật

Khi bạn có thay đổi trong mã nguồn (JS/TS) hoặc assets (hình ảnh) và muốn cập nhật ngay cho người dùng:

### Cách 1: Cập nhật cho môi trường Production (Khuyên dùng)

Bạn nên chỉ định platform (android hoặc ios) để tránh lỗi build cho các nền tảng không cần thiết (như web):

```bash
# Chỉ cập nhật cho Android

eas update --platform android --branch production --message "300"


# Chỉ cập nhật cho iOS
eas update --branch production --platform ios --message "Mô tả thay đổi"
```

> [!TIP]
> Nếu bạn chạy `eas update` mà không có `--platform`, nó sẽ cố gắng build cho cả Web và thường bị lỗi nếu thư viện không hỗ trợ Web (như lỗi `react-native-pager-view` bạn vừa gặp).

### Cách 2: Sử dụng các branch khác (để test)

Bạn có thể đẩy lên branch `preview` hoặc `development` (nếu đã cấu hình trong ứng dụng):

```bash
eas update --branch preview --message "Tính năng mới đang test"
```

## 3. Cấu hình tự động/thủ công

Theo mặc định (`app.json`), ứng dụng sẽ kiểm tra cập nhật mỗi khi khởi động.
Nếu bạn muốn kiểm tra thủ công trong ứng dụng, hãy sử dụng Hook `useExpoUpdate` đã được tạo.

## 4. Lưu ý quan trọng

> [!CAUTION]
> EAS Update **KHÔNG THỂ** cập nhật các thay đổi liên quan đến Native Code (ví dụ: cài bản expo-camera mới, thay đổi file trong thư mục `android/` hoặc `ios/`).
> Đối với những thay đổi này, bạn **BẮT BUỘC** phải build lại APK/AAB mới.

> [!TIP]
> Bạn có thể kiểm tra lịch sử các bản cập nhật tại: [Expo Dashboard](https://expo.dev/accounts/wantech/projects/locket-wan/updates)
