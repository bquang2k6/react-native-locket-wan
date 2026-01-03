import React, { useRef, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import PagerView from "react-native-pager-view";
// import ProfileScreen from "./ProfileTab/index";
import PostCaption from "./PostCaption"
import TabTwoScreen from "./MessageTab";
import HomePage from "./HomeTab";
// import Login from "./Login"

const { width, height } = Dimensions.get("window");

// HomeScreen với horizontal PagerView
export default function HomeScreen() {
  const pagerRef = useRef<PagerView>(null);
  const [isOnRollcall, setIsOnRollcall] = useState(false);

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

    // Reset rollcall state when changing main tabs
    if (pageKey !== 'home') {
      setIsOnRollcall(false);
    }
  };

  return (
    <PagerView
      style={styles.horizontalPager}
      initialPage={pageMap.home}
      ref={pagerRef}
      scrollEnabled={!isOnRollcall} // Disable horizontal swipe when on rollcall
    >
      <View key="profile">
        <PostCaption goToPage={goToPage} />
      </View>
      <View key="home">
        <HomePage goToPage={goToPage} setIsOnRollcall={setIsOnRollcall} />
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
