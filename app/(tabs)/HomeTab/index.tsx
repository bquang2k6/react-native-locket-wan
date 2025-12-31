import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeHeader from "@/components/ui/headerhome";
import HistoryTab from "./HistoryTab";
import MainHomeTab from "./MainHomeTab";

interface ProfileScreenProps {
  goToPage: (pageKey: string) => void;
}
export default function HomePage({ goToPage }: ProfileScreenProps) {
  const verticalPagerRef = useRef<PagerView>(null);
  const insets = useSafeAreaInsets();
  const pageMap: Record<string, number> = {
    main: 0,
    history: 1,
  };
  const goToPageVertical = (pageKey: string) => {
    const pageIndex = pageMap[pageKey];
    if (pageIndex !== undefined) {
      verticalPagerRef.current?.setPage(pageIndex);
    }
  };

  return (
    <View style={styles.homeContainer}>
      {/* Header cố định */}
      <HomeHeader goToPage={goToPage} />

      {/* Vertical PagerView chiếm phần còn lại */}
      <PagerView
        style={[styles.verticalPager]}
        initialPage={pageMap.main}
        orientation="vertical"
        ref={verticalPagerRef}
      >
        <View key="main" style={styles.page}>
          <MainHomeTab goToPage={goToPageVertical} />
        </View>

        <View key="history" style={styles.page}>
          <HistoryTab goToPage={goToPageVertical} />
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalPager: { flex: 1 },
  homeContainer: { flex: 1, backgroundColor: "#000000ff" },
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
