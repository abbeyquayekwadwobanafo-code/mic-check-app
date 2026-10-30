import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RapperAvatar from "../components/RapperAvatar";
import { rappers } from "../data/rappers";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  All: "apps",
  Facts: "bulb",
  Discography: "disc",
  Songs: "musical-notes",
  "Track Numbers": "list",
};

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
      <View style={styles.header}>
        <RapperAvatar id={rapper.id} name={rapper.name} size={130} />
        <Text style={styles.artist}>{rapper.name.toUpperCase()}</Text>
        <Text style={styles.heading}>PICK A CATEGORY</Text>
      </View>

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
          <View style={styles.iconCircle}>
            <Ionicons name={icons[o.key] ?? "musical-note"} size={26} color="#f5c518" />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.name}>{o.label}</Text>
            <Text style={styles.count}>{o.count} questions</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#666" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d0d0d" },
  content: { padding: 24, paddingTop: 56 },
  empty: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    padding: 24,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 28 },
  artist: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 16,
  },
  heading: {
    color: "#f5c518",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 3,
    marginTop: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  textBox: { marginLeft: 16, flex: 1 },
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