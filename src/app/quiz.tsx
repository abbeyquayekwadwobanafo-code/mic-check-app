import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ImageSourcePropType,
} from "react-native";
import RapperAvatar from "../components/RapperAvatar";
import { rapperImages } from "../data/images";
import type { Question } from "../data/nas";
import { rappers } from "../data/rappers";
import { saveScore } from "../utils/scores";
import { shuffle } from "../utils/shuffle";

const MIXED_COUNT = 20; // how many questions in mixed mode

type QuizQuestion = Question & { artist: string; artistId: string };

// Shuffles the answer options of each question, keeping track of the correct one
function prepare(questions: QuizQuestion[]): QuizQuestion[] {
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

// Full-screen background: the artist's photo (blurred and darkened),
// or a plain dark screen if there's no photo.
function Backdrop({
  image,
  children,
}: {
  image?: ImageSourcePropType;
  children: ReactNode;
}) {
  if (!image) {
    return <View style={styles.container}>{children}</View>;
  }
  return (
    <ImageBackground
      source={image}
      style={styles.container}
      resizeMode="cover"
      blurRadius={3}
    >
      <View style={styles.overlay} />
      {children}
    </ImageBackground>
  );
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

  const isMixed = rapperId === "mixed";
  const rapper = rappers.find((r) => r.id === rapperId);
  const categoryKey = category ?? "All";
  const scoreId = isMixed ? "mixed" : rapperId ?? "";

  const questions = useMemo<QuizQuestion[]>(() => {
    if (isMixed) {
      const all: QuizQuestion[] = rappers.flatMap((r) =>
        r.questions.map((q) => ({ ...q, artist: r.name, artistId: r.id }))
      );
      return prepare(shuffle(all).slice(0, MIXED_COUNT));
    }
    if (!rapper) return [];
    const pool =
      categoryKey !== "All"
        ? rapper.questions.filter((q) => q.category === categoryKey)
        : rapper.questions;
    return prepare(
      pool.map((q) => ({ ...q, artist: rapper.name, artistId: rapper.id }))
    );
  }, [isMixed, rapper, categoryKey, round]);

  const finished = questions.length > 0 && index >= questions.length;

  useEffect(() => {
    if (finished) {
      saveScore(scoreId, categoryKey, score, questions.length).then(setNewBest);
    }
  }, [finished]);

  if (questions.length === 0) {
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
    const endImage = isMixed ? undefined : rapperImages[scoreId];
    return (
      <Backdrop image={endImage}>
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
          <Text style={styles.link}>
            {isMixed ? "Back to artists" : "Choose another category"}
          </Text>
        </Pressable>
      </Backdrop>
    );
  }

  const q = questions[index];
  const bgImage = rapperImages[q.artistId];
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
    <Backdrop image={bgImage}>
      <View style={styles.artistRow}>
        <RapperAvatar id={q.artistId} name={q.artist} size={44} />
        <Text style={styles.artist}>{q.artist.toUpperCase()}</Text>
      </View>

      <Text style={styles.progress}>
        {isMixed ? "MIXED · " : ""}
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
        let bg = "rgba(28,28,28,0.9)";
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
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    padding: 24,
    justifyContent: "center",
  },
  // Dark layer over the photo. Raise 0.78 to make it darker, lower it to show more photo.
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(13,13,13,0.78)",
  },
  artistRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  artist: { color: "#ddd", fontWeight: "800", letterSpacing: 3, marginLeft: 12 },
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
  detail: { color: "#ccc", textAlign: "center", marginTop: 8, marginBottom: 12 },
  newBest: {
    color: "#1fd05a",
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 3,
    marginBottom: 20,
  },
  link: { color: "#ccc", textAlign: "center", marginTop: 20 },
});