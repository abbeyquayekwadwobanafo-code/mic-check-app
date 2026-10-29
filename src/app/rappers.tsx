import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { rappers } from "../data/rappers";

export default function Rappers() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>PICK YOUR ARTIST</Text>

      {rappers.map((r) => (
        <Pressable
          key={r.id}
          style={styles.card}
          onPress={() =>
            router.push({ pathname: "/quiz", params: { rapper: r.id } })
          }
        >
          <Text style={styles.name}>{r.name}</Text>
          <Text style={styles.count}>{r.questions.length} questions</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d0d0d" },
  content: { padding: 24, paddingTop: 64 },
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
  name: { color: "#fff", fontSize: 20, fontWeight: "800" },
  count: { color: "#aaa", marginTop: 4 },
});