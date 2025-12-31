import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, Pressable } from "react-native";

export default function HistoryTab({
  goToPage,
}: {
  goToPage: (pageIndex: string) => void;
}) {
  return (
    <ThemedView style={styles.pageContent}>
      <ThemedText style={{ color: "white" }} type="title">
        More Content
      </ThemedText>
      <ThemedText>Đây là phần nội dung thứ hai.</ThemedText>

      {/* Nút demo quay về main page */}
      <Pressable
        onPress={() => goToPage("main")}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#34C759",
          borderRadius: 8,
        }}
      >
        <ThemedText style={{ color: "white", fontWeight: "600" }}>
          Quay về Main
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: "#000000ff",
  },
});
