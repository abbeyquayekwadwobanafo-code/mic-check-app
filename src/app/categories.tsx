import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { rappers } from "../data/rappers";

export default function Categories() {
  const router = useRouter();
  const { rapper: rapperId } = useLocalSearchParams<{ rapper: string }>();
  const rapper = rappers.find((r) => r.id === rapperId);

  if (!rapper) {
    return (
      <View style={styles.empty}>
        <Text style={styles.name}>Pick an artist first.</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  const names = Array.from(new Set(rapper.questions.map((q) => q.category)));
  const options = [
    { key: "All", label: "ALL QUESTIONS", count: rapper.questions.length },
    ...names.map((n) => ({
      key: n,
      label: n.toUpperCase(),
      count: rapper.questions.filter((q) => q.category === n).length,
    })),
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.artist}>{rapper.name.toUpperCase()}</Text>
      <Text style={styles.heading}>PICK A CATEGORY</Text>

      {options.map((o) => (
        <Pressable
          key={o.key}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/quiz",
              params: { rapper: rapper.id, category: o.key },
            })
          }
        >
          <Text style={styles.name}>{o.label}</Text>
          <Text style={styles.count}>{o.count} questions</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d0d0d" },
  content: { padding: 24, paddingTop: 64 },
  empty: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    padding: 24,
    justifyContent: "center",
  },
  artist: { color: "#888", fontWeight: "700", letterSpacing: 3, marginBottom: 6 },
  heading: {
    color: "#f5c518",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#1c1c1c",
    padding: 20,
    borderRadius: 14,
    marginBottom: 14,
  },
  name: { color: "#fff", fontSize: 18, fontWeight: "800" },
  count: { color: "#aaa", marginTop: 4 },
  backButton: {
    backgroundColor: "#f5c518",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  backText: { color: "#0d0d0d", fontWeight: "800", fontSize: 16 },
});