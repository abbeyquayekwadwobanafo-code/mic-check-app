import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import RapperAvatar from "../../components/RapperAvatar";
import { rappers } from "../../data/rappers";
import {
  getProfile,
  saveProfile,
  type Profile as ProfileData,
} from "../../utils/profile";
import { getRank } from "../../utils/ranks";
import {
  getAllBest,
  getStats,
  type Scores,
  type Stats,
} from "../../utils/scores";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({ name: "", favorite: null });
  const [scores, setScores] = useState<Scores>({});
  const [stats, setStats] = useState<Stats>({ played: 0, correct: 0, answered: 0 });

  // Reload everything each time this tab comes into view
  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfile);
      getAllBest().then(setScores);
      getStats().then(setStats);
    }, [])
  );

  function update(next: ProfileData) {
    setProfile(next);
    saveProfile(next);
  }

  // Your rank comes from your best percentage in any category with 10+ questions
  const pcts = Object.values(scores)
    .filter((s) => s.total >= 10)
    .map((s) => (s.score / s.total) * 100);
  const hasRank = pcts.length > 0;
  const rank = getRank(hasRank ? Math.max(...pcts) : 0);
  const accuracy =
    stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

  const mixed = scores["mixed:All"];
  const mixedTimed = scores["mixed:All-timed"];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <RapperAvatar
          id={profile.favorite ?? "none"}
          name={profile.name || "?"}
          size={110}
        />

        <TextInput
          style={styles.nameInput}
          value={profile.name}
          onChangeText={(t) => update({ ...profile, name: t })}
          placeholder="Your name"
          placeholderTextColor="#555"
          maxLength={20}
          textAlign="center"
        />

        <View
          style={[
            styles.rankPill,
            { borderColor: hasRank ? rank.color : "#444" },
          ]}
        >
          <Ionicons
            name={hasRank ? rank.icon : "help-circle"}
            size={16}
            color={hasRank ? rank.color : "#777"}
          />
          <Text
            style={[styles.rankText, { color: hasRank ? rank.color : "#777" }]}
          >
            {hasRank ? rank.name : "UNRANKED"}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.played}</Text>
          <Text style={styles.statLabel}>QUIZZES</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.correct}</Text>
          <Text style={styles.statLabel}>CORRECT</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{accuracy}%</Text>
          <Text style={styles.statLabel}>ACCURACY</Text>
        </View>
      </View>

      <Text style={styles.section}>FAVORITE ARTIST</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.favRow}
      >
        {rappers.map((r) => {
          const selected = profile.favorite === r.id;
          return (
            <Pressable
              key={r.id}
              style={[styles.favItem, selected && styles.favItemSelected]}
              onPress={() =>
                update({ ...profile, favorite: selected ? null : r.id })
              }
            >
              <RapperAvatar id={r.id} name={r.name} size={56} />
              <Text
                style={[styles.favName, selected && { color: "#f5c518" }]}
                numberOfLines={1}
              >
                {r.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.section}>BEST SCORES</Text>

      <View style={styles.scoreRow}>
        <View style={styles.mixedIcon}>
          <Ionicons name="shuffle" size={22} color="#0d0d0d" />
        </View>
        <Text style={styles.scoreName}>Mixed Mode</Text>
        <View style={styles.scoreValues}>
          <Text style={styles.scoreText}>
            {mixed ? `${mixed.score}/${mixed.total}` : "—"}
          </Text>
          {mixedTimed && (
            <Text style={styles.timedText}>
              Timed: {mixedTimed.score}/{mixedTimed.total}
            </Text>
          )}
        </View>
      </View>

      {rappers.map((r) => {
        const best = scores[`${r.id}:All`];
        const timed = scores[`${r.id}:All-timed`];
        return (
          <View key={r.id} style={styles.scoreRow}>
            <RapperAvatar id={r.id} name={r.name} size={40} />
            <Text style={styles.scoreName}>{r.name}</Text>
            <View style={styles.scoreValues}>
              <Text style={styles.scoreText}>
                {best ? `${best.score}/${best.total}` : "—"}
              </Text>
              {timed && (
                <Text style={styles.timedText}>
                  Timed: {timed.score}/{timed.total}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d0d0d" },
  content: { padding: 24, paddingTop: 64, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 24 },
  nameInput: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 16,
    minWidth: 200,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  rankPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: "#161616",
  },
  rankText: { fontWeight: "900", letterSpacing: 2, marginLeft: 8 },
  statsRow: { flexDirection: "row", marginBottom: 28 },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1c1c1c",
    alignItems: "center",
  },
  statValue: { color: "#fff", fontSize: 24, fontWeight: "900" },
  statLabel: {
    color: "#888",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
  },
  section: {
    color: "#f5c518",
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 12,
  },
  favRow: { marginBottom: 28, flexGrow: 0 },
  favItem: {
    width: 84,
    alignItems: "center",
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  favItemSelected: { borderColor: "#f5c518", backgroundColor: "#1c1c1c" },
  favName: { color: "#aaa", fontSize: 11, fontWeight: "700", marginTop: 6 },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  mixedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5c518",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreName: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 12, flex: 1 },
  scoreValues: { alignItems: "flex-end" },
  scoreText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  timedText: { color: "#f5c518", fontSize: 11, marginTop: 2 },
});