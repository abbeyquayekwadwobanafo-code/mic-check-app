import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { rappers } from "../data/rappers";

export default function Quiz() {
  const router = useRouter();
  const { rapper: rapperId } = useLocalSearchParams<{ rapper: string }>();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const rapper = rappers.find((r) => r.id === rapperId);

  if (!rapper) {
    return (
      <View style={styles.container}>
        <Text style={styles.question}>Pick an artist first.</Text>
        <Pressable style={styles.nextButton} onPress={() => router.back()}>
          <Text style={styles.nextText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  const questions = rapper.questions;

  if (index >= questions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>DONE!</Text>
        <Text style={styles.score}>
          {score} / {questions.length}
        </Text>
        <Pressable
          style={styles.nextButton}
          onPress={() => {
            setIndex(0);
            setScore(0);
            setSelected(null);
          }}
        >
          <Text style={styles.nextText}>PLAY AGAIN</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Pick another artist</Text>
        </Pressable>
      </View>
    );
  }

  const q = questions[index];

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) setScore(score + 1);
  }

  function next() {
    setSelected(null);
    setIndex(index + 1);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.artist}>{rapper.name.toUpperCase()}</Text>
      <Text style={styles.progress}>
        {q.category.toUpperCase()} · {index + 1}/{questions.length}
      </Text>
      <Text style={styles.question}>{q.question}</Text>

      {q.options.map((opt, i) => {
        let bg = "#1c1c1c";
        if (selected !== null) {
          if (i === q.answer) bg = "#1f7a3a";
          else if (i === selected) bg = "#a12626";
        }
        return (
          <Pressable
            key={i}
            style={[styles.option, { backgroundColor: bg }]}
            onPress={() => choose(i)}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </Pressable>
        );
      })}

      {selected !== null && (
        <Pressable style={styles.nextButton} onPress={next}>
          <Text style={styles.nextText}>
            {index === questions.length - 1 ? "FINISH" : "NEXT"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    padding: 24,
    justifyContent: "center",
  },
  artist: { color: "#888", fontWeight: "700", letterSpacing: 3, marginBottom: 6 },
  progress: { color: "#f5c518", fontWeight: "700", letterSpacing: 2, marginBottom: 12 },
  question: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 28 },
  option: { padding: 16, borderRadius: 12, marginBottom: 12 },
  optionText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  nextButton: {
    backgroundColor: "#f5c518",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  nextText: { color: "#0d0d0d", fontWeight: "800", fontSize: 16 },
  heading: { color: "#f5c518", fontSize: 44, fontWeight: "900", textAlign: "center" },
  score: { color: "#fff", fontSize: 32, textAlign: "center", marginVertical: 24 },
  link: { color: "#aaa", textAlign: "center", marginTop: 20 },
});