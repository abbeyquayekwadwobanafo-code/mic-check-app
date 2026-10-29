import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { nasQuestions } from "../data/nas";

export default function Quiz() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  if (index >= nasQuestions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>DONE!</Text>
        <Text style={styles.score}>
          {score} / {nasQuestions.length}
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
          <Text style={styles.link}>Back to home</Text>
        </Pressable>
      </View>
    );
  }

  const q = nasQuestions[index];

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
      <Text style={styles.progress}>
        {q.category.toUpperCase()} · {index + 1}/{nasQuestions.length}
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
            {index === nasQuestions.length - 1 ? "FINISH" : "NEXT"}
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