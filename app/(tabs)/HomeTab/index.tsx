import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeHeader from "@/components/ui/headerhome";
import HistoryTab from "./HistoryTab";
import MainHomeTab from "./MainHomeTab";
import RollcallTab from "../rollcall/RollcallTab";
import Taskbar from "@/components/ui/tasbar";

interface ProfileScreenProps {
  goToPage: (pageKey: string) => void;
  setIsOnRollcall?: (isOnRollcall: boolean) => void;
}
import { useTheme } from "@/context/ThemeContext";

export default function HomePage({ goToPage, setIsOnRollcall }: ProfileScreenProps) {
  const [currentPage, setCurrentPage] = useState("main");
  const { colors } = useTheme();

  const verticalPagerRef = useRef<PagerView>(null);
  const pageMap: Record<string, number> = {
    main: 0,
    history: 1,
    rollcall: 2,
  };
  const goToPageVertical = (pageKey: string) => {
    const pageIndex = pageMap[pageKey];
    if (pageIndex !== undefined) {
      verticalPagerRef.current?.setPage(pageIndex);
      setCurrentPage(pageKey);

      // Notify parent when on rollcall
      if (setIsOnRollcall) {
        setIsOnRollcall(pageKey === 'rollcall');
      }
    }
  };

  return (
    <View style={[styles.homeContainer, { backgroundColor: colors["base-100"] }]}>
      {/* Header cố định - Hide on rollcall */}
      {currentPage !== "rollcall" && (
        <HomeHeader
          goToPage={goToPage}
          hideFriendIndicator={currentPage === "history"}
        />
      )}
      <Taskbar goToPage={goToPage} goToPageVertical={goToPageVertical} />

      {/* Vertical PagerView chiếm phần còn lại */}
      <PagerView
        style={[styles.verticalPager]}
        initialPage={pageMap.main}
        orientation="vertical"
        ref={verticalPagerRef}
        scrollEnabled={currentPage === "main"} // Only allow swipe from Main page
        onPageSelected={(e) => {
          const pos = e.nativeEvent.position;
          const newPage = pos === 0 ? "main" : pos === 1 ? "history" : "rollcall";
          setCurrentPage(newPage);

          // Notify parent when on rollcall
          if (setIsOnRollcall) {
            setIsOnRollcall(newPage === 'rollcall');
          }
        }}
      >
        <View key="main" style={styles.page}>
          <MainHomeTab goToPage={goToPageVertical} />
        </View>

        <View key="history" style={styles.page}>
          <HistoryTab goToPage={goToPageVertical} />
        </View>

        <View key="rollcall" style={styles.page}>
          <RollcallTab goToPage={goToPageVertical} />
        </View>
      </PagerView>
    </View>
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
