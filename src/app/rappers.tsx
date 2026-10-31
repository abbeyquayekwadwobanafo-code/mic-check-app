import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RapperAvatar from "../components/RapperAvatar";
import { rappers } from "../data/rappers";
import { getAllBest, type Scores } from "../utils/scores";

export default function Rappers() {
  const router = useRouter();
  const [scores, setScores] = useState<Scores>({});

  useFocusEffect(
    useCallback(() => {
      getAllBest().then(setScores);
    }, [])
  );

  const mixedBest = scores["mixed:All"];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>PICK YOUR ARTIST</Text>

      <Pressable
        style={[styles.card, styles.mixedCard]}
        onPress={() =>
          router.push({
            pathname: "/quiz",
            params: { rapper: "mixed", category: "All" },
          })
        }
      >
        <View style={styles.mixedIcon}>
          <Ionicons name="shuffle" size={32} color="#0d0d0d" />
        </View>
        <View style={styles.textBox}>
          <Text style={styles.name}>MIXED MODE</Text>
          <Text style={styles.count}>
            20 random questions from all artists
            {mixedBest ? `  ·  Best: ${mixedBest.score}/${mixedBest.total}` : ""}
          </Text>
        </View>
      </Pressable>

      {rappers.map((r) => (
        <Pressable
          key={r.id}
          style={styles.card}
          onPress={() =>
            router.push({ pathname: "/categories", params: { rapper: r.id } })
          }
        >
          <RapperAvatar id={r.id} name={r.name} size={64} />
          <View style={styles.textBox}>
            <Text style={styles.name}>{r.name}</Text>
            <Text style={styles.count}>{r.questions.length} questions</Text>
          </View>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  mixedCard: { borderWidth: 2, borderColor: "#f5c518" },
  mixedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f5c518",
    alignItems: "center",
    justifyContent: "center",
  },
  textBox: { marginLeft: 16, flex: 1 },
  name: { color: "#fff", fontSize: 20, fontWeight: "800" },
  count: { color: "#aaa", marginTop: 4 },
});