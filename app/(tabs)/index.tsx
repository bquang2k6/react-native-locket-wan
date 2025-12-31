import React, { useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import PagerView from "react-native-pager-view";
import ProfileScreen from "./ProfileTab/index";
import TabTwoScreen from "./MessageTab";
import HomePage from "./HomeTab";

const { width, height } = Dimensions.get("window");

// HomeScreen với horizontal PagerView
export default function HomeScreen() {
  const pagerRef = useRef<PagerView>(null);

  // Mapping string key -> number index
  const pageMap: Record<string, number> = {
    profile: 0,
    home: 1,
    messages: 2,
  };

  const goToPage = (pageKey: string) => {
    const pageIndex = pageMap[pageKey];
    if (pageIndex !== undefined) {
      pagerRef.current?.setPage(pageIndex);
    }
  };

  return (
    <PagerView
      style={styles.horizontalPager}
      initialPage={pageMap.home}
      ref={pagerRef}
    >
      <View key="profile">
        <ProfileScreen goToPage={goToPage} />
      </View>
      <View key="home">
        <HomePage goToPage={goToPage} />
      </View>
      <View key="messages">
        <TabTwoScreen />
      </View>
    </PagerView>
  );
}

const styles = StyleSheet.create({
  horizontalPager: { flex: 1 },
  homeContainer: { flex: 1 },
  verticalPager: { flex: 1 },
  page: { flex: 1, zIndex: 5 },
  pageContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
});
