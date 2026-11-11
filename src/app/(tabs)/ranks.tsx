import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import RapperAvatar from "../../components/RapperAvatar";
import { rappers } from "../../data/rappers";
import { loadOverview } from "../../lib/friends";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../lib/useSession";
import { getRank } from "../../utils/ranks";
import { syncBestScores } from "../../utils/scores";

type Row = {
  user_id: string;
  score: number;
  total: number;
  profiles: {
    username: string;
    display_name: string;
    favorite: string | null;
  } | null;
};

const SELECT = "user_id, score, total, profiles(username, display_name, favorite)";
const PODIUM = ["#f5c518", "#c0c0c0", "#cd7f32"];

function Chip({
  label,
  selected,
  onPress,
  children,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {children}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function Ranks() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const myId = session?.user.id;

  const [board, setBoard] = useState("mixed");
  const [timed, setTimed] = useState(false);
  const [scope, setScope] = useState<"everyone" | "friends">("everyone");
  const [rows, setRows] = useState<Row[]>([]);
  const [myRow, setMyRow] = useState<Row | null>(null);
  const [myPos, setMyPos] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const boardKey = `${board}:All${timed ? "-timed" : ""}`;
  const boardName =
    board === "mixed" ? "Mixed Mode" : rappers.find((r) => r.id === board)?.name ?? "";

  const load = useCallback(async () => {
    if (!myId) return;
    try {
      let query = supabase
        .from("scores")
        .select(SELECT)
        .eq("board", boardKey)
        .order("pct", { ascending: false })
        .order("total", { ascending: false })
        .order("updated_at", { ascending: true })
        .limit(50);

      if (scope === "friends") {
        const overview = await loadOverview(myId);
        const ids = [myId, ...overview.friends.map((f) => f.person.id)];
        query = query.in("user_id", ids);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      const list = (data ?? []) as unknown as Row[];
      setRows(list);

      // Where do you stand?
      const index = list.findIndex((r) => r.user_id === myId);
      if (index >= 0) {
        setMyRow(list[index]);
        setMyPos(index + 1);
      } else if (scope === "everyone") {
        const { data: mine } = await supabase
          .from("scores")
          .select(SELECT)
          .eq("board", boardKey)
          .eq("user_id", myId)
          .maybeSingle();
        if (mine) {
          const m = mine as unknown as Row;
          const { count } = await supabase
            .from("scores")
            .select("user_id", { count: "exact", head: true })
            .eq("board", boardKey)
            .gt("pct", m.score / m.total + 1e-9);
          setMyRow(m);
          setMyPos((count ?? 0) + 1);
        } else {
          setMyRow(null);
          setMyPos(null);
        }
      } else {
        setMyRow(null);
        setMyPos(null);
      }
      setError("");
    } catch {
      setError("Couldn't load the leaderboard. Check your internet.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [myId, boardKey, scope]);

  // Every time you open the tab or change a filter: send your scores, then load
  useFocusEffect(
    useCallback(() => {
      if (!myId) return;
      setLoading(true);
      syncBestScores().finally(load);
    }, [myId, load])
  );

  function playBoard() {
    router.push({
      pathname: "/quiz",
      params: { rapper: board, category: "All", timer: timed ? "1" : "0" },
    });
  }

  if (sessionLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f5c518" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Ionicons name="trophy" size={64} color="#f5c518" />
        <Text style={styles.title}>RANKS</Text>
        <Text style={styles.lockText}>
          Log in to join the leaderboard and see how you rank. You can create
          your account in the Profile tab.
        </Text>
        <Pressable style={styles.button} onPress={() => router.push("/profile")}>
          <Text style={styles.buttonText}>GO TO PROFILE</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>RANKS</Text>
        <Text style={styles.subtitle}>
          {boardName}
          {timed ? " · Timed" : ""}
        </Text>
      </View>

      {/* artist chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <Chip label="MIXED" selected={board === "mixed"} onPress={() => setBoard("mixed")}>
          <Ionicons
            name="shuffle"
            size={16}
            color={board === "mixed" ? "#0d0d0d" : "#f5c518"}
            style={{ marginRight: 6 }}
          />
        </Chip>
        {rappers.map((r) => (
          <Chip
            key={r.id}
            label={r.name.toUpperCase()}
            selected={board === r.id}
            onPress={() => setBoard(r.id)}
          >
            <View style={{ marginRight: 6 }}>
              <RapperAvatar id={r.id} name={r.name} size={22} />
            </View>
          </Chip>
        ))}
      </ScrollView>

      {/* everyone / friends and timed */}
      <View style={styles.controls}>
        <View style={styles.segment}>
          {(["everyone", "friends"] as const).map((s) => (
            <Pressable
              key={s}
              style={[styles.segmentItem, scope === s && styles.segmentActive]}
              onPress={() => setScope(s)}
            >
              <Text
                style={[styles.segmentText, scope === s && styles.segmentTextActive]}
              >
                {s.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.timedBox}>
          <Ionicons name="timer" size={18} color="#f5c518" />
          <Switch
            value={timed}
            onValueChange={setTimed}
            trackColor={{ false: "#333", true: "#a87a00" }}
            thumbColor={timed ? "#f5c518" : "#888"}
          />
        </View>
      </View>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <View style={styles.listCenter}>
          <ActivityIndicator color="#f5c518" />
        </View>
      ) : (
        <FlatList<Row>
          data={rows}
          keyExtractor={(r) => r.user_id}
          contentContainerStyle={rows.length === 0 ? { flexGrow: 1 } : { paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                syncBestScores().finally(load);
              }}
              tintColor="#f5c518"
              colors={["#f5c518"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={56} color="#555" />
              <Text style={styles.emptyTitle}>NO SCORES YET</Text>
              <Text style={styles.emptyText}>
                {scope === "friends"
                  ? "Nobody in your circle has played this board. Be the first!"
                  : "Be the first on this board."}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const p = item.profiles;
            const name = p ? p.display_name || p.username : "Player";
            const pct = (item.score / item.total) * 100;
            const rk = getRank(pct);
            const mine = item.user_id === myId;
            return (
              <View style={[styles.row, mine && styles.rowMine]}>
                <View style={styles.position}>
                  {index < 3 ? (
                    <Ionicons name="trophy" size={22} color={PODIUM[index]} />
                  ) : (
                    <Text style={styles.positionText}>{index + 1}</Text>
                  )}
                </View>
                <RapperAvatar id={p?.favorite ?? "none"} name={name} size={44} />
                <View style={styles.rowText}>
                  <Text style={styles.name} numberOfLines={1}>
                    {name}
                    {mine ? "  (you)" : ""}
                  </Text>
                  <Text style={styles.user} numberOfLines={1}>
                    {p ? `@${p.username}` : ""}
                  </Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.score}>
                    {item.score}/{item.total}
                  </Text>
                  <View style={styles.pctRow}>
                    <Ionicons name={rk.icon} size={12} color={rk.color} />
                    <Text style={[styles.pct, { color: rk.color }]}>
                      {Math.round(pct)}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* your position, always visible */}
      <View style={styles.youBar}>
        {myRow && myPos ? (
          <>
            <Text style={styles.youPos}>#{myPos}</Text>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.youLabel}>YOUR BEST</Text>
              <Text style={styles.youScore}>
                {myRow.score}/{myRow.total} ·{" "}
                {Math.round((myRow.score / myRow.total) * 100)}%
              </Text>
            </View>
            <Pressable style={styles.playAgain} onPress={playBoard}>
              <Text style={styles.playText}>BEAT IT</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={{ flex: 1 }}>
              <Text style={styles.youLabel}>YOU'RE NOT ON THIS BOARD YET</Text>
              <Text style={styles.youScore}>Play it to get ranked</Text>
            </View>
            <Pressable style={styles.playAgain} onPress={playBoard}>
              <Text style={styles.playText}>PLAY</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d0d0d", paddingTop: 56 },
  center: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  listCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { color: "#f5c518", fontSize: 24, fontWeight: "900", letterSpacing: 3 },
  subtitle: { color: "#888", fontWeight: "700", marginTop: 2 },
  lockText: { color: "#aaa", marginTop: 10, textAlign: "center", lineHeight: 21 },
  button: {
    marginTop: 24,
    backgroundColor: "#f5c518",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: { color: "#0d0d0d", fontWeight: "800", letterSpacing: 1 },
  chipRow: { flexGrow: 0, marginBottom: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#161616",
    marginRight: 8,
  },
  chipSelected: { backgroundColor: "#f5c518", borderColor: "#f5c518" },
  chipText: { color: "#ccc", fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  chipTextSelected: { color: "#0d0d0d" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 9,
  },
  segmentActive: { backgroundColor: "#f5c518" },
  segmentText: { color: "#888", fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  segmentTextActive: { color: "#0d0d0d" },
  timedBox: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  error: { color: "#ff6b6b", marginHorizontal: 20, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#161616",
  },
  rowMine: { backgroundColor: "#1c1a0e" },
  position: { width: 34, alignItems: "center" },
  positionText: { color: "#888", fontSize: 16, fontWeight: "900" },
  rowText: { flex: 1, marginLeft: 12 },
  name: { color: "#fff", fontSize: 16, fontWeight: "800" },
  user: { color: "#777", fontSize: 12, marginTop: 1 },
  scoreBox: { alignItems: "flex-end" },
  score: { color: "#fff", fontSize: 16, fontWeight: "900" },
  pctRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  pct: { fontSize: 12, fontWeight: "800", marginLeft: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: {
    color: "#888",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 12,
  },
  emptyText: { color: "#777", textAlign: "center", marginTop: 8, lineHeight: 20 },
  youBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderTopWidth: 2,
    borderTopColor: "#f5c518",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  youPos: { color: "#f5c518", fontSize: 26, fontWeight: "900" },
  youLabel: { color: "#888", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  youScore: { color: "#fff", fontWeight: "800", marginTop: 2 },
  playAgain: {
    backgroundColor: "#f5c518",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  playText: { color: "#0d0d0d", fontWeight: "900", letterSpacing: 1 },
});