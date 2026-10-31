import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { RANKS, getRank } from "../utils/ranks";

type Props = {
  title: string; // e.g. "Nas" or "Mixed Mode"
  score: number;
  total: number;
  bestStreak: number;
  newBest: boolean;
  timed: boolean;
  backLabel: string;
  onPlayAgain: () => void;
  onBack: () => void;
};

export default function Results({
  title,
  score,
  total,
  bestStreak,
  newBest,
  timed,
  backLabel,
  onPlayAgain,
  onBack,
}: Props) {
  const pct = (score / total) * 100;
  const rank = getRank(pct);
  const rankIndex = RANKS.indexOf(rank);
  const next = RANKS[rankIndex + 1];
  const need = next
    ? Math.max(1, Math.ceil((total * next.min) / 100) - score)
    : 0;

  const pop = useRef(new Animated.Value(0.3)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pop, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    loop.start();

    if (rankIndex >= 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    return () => loop.stop();
  }, []);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.7],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  function shareScore() {
    Share.share({
      message: `I scored ${score}/${total} (${Math.round(pct)}%) on ${title}${
        timed ? " in timer mode" : ""
      } in Mic Check and hit the rank ${rank.name}. Can you beat that?`,
    }).catch(() => {});
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      {timed && (
        <View style={styles.timerTag}>
          <Ionicons name="timer" size={13} color="#f5c518" />
          <Text style={styles.timerTagText}>TIMER MODE</Text>
        </View>
      )}

      {/* rank badge */}
      <View style={styles.badgeWrap}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              borderColor: rank.color,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.badge,
            {
              borderColor: rank.color,
              shadowColor: rank.color,
              transform: [{ scale: pop }],
              opacity: fade,
            },
          ]}
        >
          <Ionicons name={rank.icon} size={64} color={rank.color} />
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: fade, alignItems: "center" }}>
        <Text style={[styles.rankName, { color: rank.color }]}>{rank.name}</Text>
        <Text style={styles.rankLine}>{rank.line}</Text>
      </Animated.View>

      {newBest && score > 0 && (
        <View style={styles.newBest}>
          <Ionicons name="trophy" size={16} color="#0d0d0d" />
          <Text style={styles.newBestText}>NEW BEST!</Text>
        </View>
      )}

      {/* stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {score}/{total}
          </Text>
          <Text style={styles.statLabel}>SCORE</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round(pct)}%</Text>
          <Text style={styles.statLabel}>ACCURACY</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{bestStreak}</Text>
          <Text style={styles.statLabel}>BEST STREAK</Text>
        </View>
      </View>

      {/* rank ladder */}
      <View style={styles.ladder}>
        {RANKS.map((r, i) => {
          const reached = i <= rankIndex;
          return (
            <View
              key={r.name}
              style={[
                styles.ladderDot,
                reached
                  ? { backgroundColor: "#1c1c1c", borderColor: r.color }
                  : { backgroundColor: "#161616", borderColor: "#2a2a2a" },
              ]}
            >
              <Ionicons
                name={r.icon}
                size={15}
                color={reached ? r.color : "#444"}
              />
            </View>
          );
        })}
      </View>
      <Text style={styles.nextText}>
        {next
          ? `${need} more correct for ${next.name}`
          : "You're at the top. Respect."}
      </Text>

      {/* buttons */}
      <Pressable style={styles.primary} onPress={onPlayAgain}>
        <Text style={styles.primaryText}>PLAY AGAIN</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={shareScore}>
        <Ionicons name="share-social" size={18} color="#f5c518" />
        <Text style={styles.secondaryText}>SHARE SCORE</Text>
      </Pressable>
      <Pressable onPress={onBack}>
        <Text style={styles.link}>{backLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, alignSelf: "stretch" },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  title: { color: "#aaa", fontWeight: "800", letterSpacing: 4 },
  timerTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#2a2a2a",
  },
  timerTagText: {
    color: "#f5c518",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1,
    marginLeft: 5,
  },
  badgeWrap: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 22,
  },
  ring: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
  },
  badge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    backgroundColor: "rgba(20,20,20,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.9,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  rankName: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },
  rankLine: { color: "#ccc", marginTop: 6, textAlign: "center" },
  newBest: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#1fd05a",
  },
  newBestText: {
    color: "#0d0d0d",
    fontWeight: "900",
    letterSpacing: 2,
    marginLeft: 6,
  },
  statsRow: { flexDirection: "row", marginTop: 22, alignSelf: "stretch" },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(28,28,28,0.9)",
    alignItems: "center",
  },
  statValue: { color: "#fff", fontSize: 22, fontWeight: "900" },
  statLabel: {
    color: "#888",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
  },
  ladder: { flexDirection: "row", marginTop: 22 },
  ladderDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    marginHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: { color: "#aaa", marginTop: 10, marginBottom: 22 },
  primary: {
    alignSelf: "stretch",
    backgroundColor: "#f5c518",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#0d0d0d", fontWeight: "800", fontSize: 16 },
  secondary: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f5c518",
  },
  secondaryText: {
    color: "#f5c518",
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 8,
  },
  link: { color: "#ccc", textAlign: "center", marginTop: 18 },
});