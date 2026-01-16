# react-native-locket-wan
Locket Wan mobile app built with React Native for Android and iOS.
cd android
.\gradlew clean
.\gradlew assembleRelease


npx expo prebuild --clean
adb install app-release.apk
npx expo run:android
npx expo start