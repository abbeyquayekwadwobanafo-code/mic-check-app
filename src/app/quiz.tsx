import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Question } from "../data/nas";
import { rappers } from "../data/rappers";
import { saveScore } from "../utils/scores";
import { shuffle } from "../utils/shuffle";

// Shuffles the question order and each question's answer options,
// keeping track of where the correct answer ends up.
function prepare(questions: Question[]): Question[] {
  return shuffle(questions).map((q) => {
    const correct = q.options[q.answer];
    const options = shuffle(q.options);
    return { ...q, options, answer: options.indexOf(correct) };
  });
}

function verdict(pct: number) {
  if (pct >= 90) return "CERTIFIED HEAD";
  if (pct >= 70) return "REAL ONE";
  if (pct >= 50) return "NOT BAD";
  if (pct >= 30) return "KEEP LISTENING";
  return "BACK TO THE LAB";
}

export default function Quiz() {
  const router = useRouter();
  const { rapper: rapperId, category } = useLocalSearchParams<{
    rapper: string;
    category?: string;
  }>();

  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [newBest, setNewBest] = useState(false);

  const rapper = rappers.find((r) => r.id === rapperId);
  const categoryKey = category ?? "All";

  const questions = useMemo(() => {
    if (!rapper) return [];
    const pool =
      categoryKey !== "All"
        ? rapper.questions.filter((q) => q.category === categoryKey)
        : rapper.questions;
    return prepare(pool);
  }, [rapper, categoryKey, round]);

  const finished = questions.length > 0 && index >= questions.length;

  useEffect(() => {
    if (finished && rapper) {
      saveScore(rapper.id, categoryKey, score, questions.length).then(setNewBest);
    }
  }, [finished]);

  if (!rapper || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.question}>Pick an artist first.</Text>
        <Pressable style={styles.nextButton} onPress={() => router.back()}>
          <Text style={styles.nextText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <View style={styles.container}>
        <Text style={styles.verdict}>{verdict(pct)}</Text>
        <Text style={styles.score}>
          {score} / {questions.length}
        </Text>
        <Text style={styles.detail}>
          {pct}% · Best streak: {bestStreak}
        </Text>
        {newBest && score > 0 && <Text style={styles.newBest}>NEW BEST!</Text>}

        <Pressable
          style={styles.nextButton}
          onPress={() => {
            setRound(round + 1);
            setIndex(0);
            setScore(0);
            setStreak(0);
            setBestStreak(0);
            setSelected(null);
            setNewBest(false);
          }}
        >
          <Text style={styles.nextText}>PLAY AGAIN</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Choose another category</Text>
        </Pressable>
      </View>
    );
  }

  const q = questions[index];
  const answered = index + (selected !== null ? 1 : 0);
  const progress = (answered / questions.length) * 100;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) {
      setScore(score + 1);
      const next = streak + 1;
      setStreak(next);
      if (next > bestStreak) setBestStreak(next);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
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

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>

      {streak >= 2 && (
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={18} color="#ff7a1a" />
          <Text style={styles.streakText}>{streak} in a row</Text>
        </View>
      )}

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
  progress: { color: "#f5c518", fontWeight: "700", letterSpacing: 2, marginBottom: 10 },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2a2a2a",
    overflow: "hidden",
    marginBottom: 16,
  },
  barFill: { height: 6, borderRadius: 3, backgroundColor: "#f5c518" },
  streakRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  streakText: { color: "#ff7a1a", fontWeight: "800", marginLeft: 6 },
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
  verdict: {
    color: "#f5c518",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 2,
  },
  score: { color: "#fff", fontSize: 44, fontWeight: "900", textAlign: "center", marginTop: 16 },
  detail: { color: "#aaa", textAlign: "center", marginTop: 8, marginBottom: 12 },
  newBest: {
    color: "#1fd05a",
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 3,
    marginBottom: 20,
  },
  link: { color: "#aaa", textAlign: "center", marginTop: 20 },
});