import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DarkAlert from "../../components/DarkAlert";
import RapperAvatar from "../../components/RapperAvatar";
import { rappers } from "../../data/rappers";
import { setGuest } from "../../lib/guest";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../lib/useSession";
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

type Account = {
  username: string;
  display_name: string;
  favorite: string | null;
};

export default function Profile() {
  const router = useRouter();
  const { session } = useSession();
  const myId = session?.user.id;

  const [local, setLocal] = useState<ProfileData>({ name: "", favorite: null });
  const [account, setAccount] = useState<Account | null>(null);
  const [scores, setScores] = useState<Scores>({});
  const [stats, setStats] = useState<Stats>({ played: 0, correct: 0, answered: 0 });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");

  // Reload everything each time this tab comes into view
  useFocusEffect(
    useCallback(() => {
      getProfile().then(setLocal);
      getAllBest().then(setScores);
      getStats().then(setStats);
      if (myId) {
        supabase
          .from("profiles")
          .select("username, display_name, favorite")
          .eq("id", myId)
          .single()
          .then(({ data }) => {
            if (data) setAccount(data as Account);
          });
      }
    }, [myId])
  );

  // Clear account info when logged out
  useEffect(() => {
    if (!session) {
      setAccount(null);
      setEditing(false);
    }
  }, [session]);

  const shownName = account
    ? account.display_name || `@${account.username}`
    : local.name;
  const favorite = account ? account.favorite : local.favorite;

  async function chooseFavorite(id: string) {
    const next = favorite === id ? null : id;

    const updatedLocal = { ...local, favorite: next };
    setLocal(updatedLocal);
    saveProfile(updatedLocal);

    if (account && myId) {
      setAccount({ ...account, favorite: next });
      const { error } = await supabase
        .from("profiles")
        .update({ favorite: next })
        .eq("id", myId);
      setMessage(error ? "Couldn't save your favorite. Check your internet." : "");
    }
  }

  async function saveName() {
    if (!account || !myId) return;
    const name = draft.trim().slice(0, 20);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("id", myId);
    if (error) {
      setMessage("Couldn't save your name. Check your internet.");
      return;
    }
    setAccount({ ...account, display_name: name });
    setEditing(false);
    setMessage("");
  }

  async function logOut() {
    await supabase.auth.signOut();
    await setGuest(false);
    router.replace("/welcome");
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
        <RapperAvatar id={favorite ?? "none"} name={shownName || "?"} size={110} />

        {/* name: from your account when logged in, otherwise saved on the phone */}
        {account ? (
          editing ? (
            <View style={styles.editBox}>
              <TextInput
                style={styles.nameInput}
                value={draft}
                onChangeText={setDraft}
                placeholder="Display name"
                placeholderTextColor="#555"
                maxLength={20}
                textAlign="center"
                autoFocus
              />
              <View style={styles.editButtons}>
                <Pressable style={styles.smallFilled} onPress={saveName}>
                  <Text style={styles.smallFilledText}>SAVE</Text>
                </Pressable>
                <Pressable
                  style={styles.smallOutline}
                  onPress={() => setEditing(false)}
                >
                  <Text style={styles.smallOutlineText}>CANCEL</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.nameRow}
              onPress={() => {
                setDraft(account.display_name);
                setEditing(true);
              }}
            >
              <Text style={styles.nameText}>{shownName}</Text>
              <Ionicons name="pencil" size={16} color="#888" style={{ marginLeft: 8 }} />
            </Pressable>
          )
        ) : (
          <TextInput
            style={styles.nameInput}
            value={local.name}
            onChangeText={(t) => {
              const next = { ...local, name: t };
              setLocal(next);
              saveProfile(next);
            }}
            placeholder="Your name"
            placeholderTextColor="#555"
            maxLength={20}
            textAlign="center"
          />
        )}

        {account && <Text style={styles.username}>@{account.username}</Text>}

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

      {message !== "" && <Text style={styles.message}>{message}</Text>}

      {/* guest card */}
      {!session && (
        <View style={styles.loginCard}>
          <Ionicons name="person-circle" size={32} color="#f5c518" />
          <Text style={styles.loginText}>
            You're playing as a guest. Log in or create an account to add
            friends, chat and join the leaderboard.
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push("/welcome")}
          >
            <Text style={styles.loginButtonText}>LOG IN / CREATE ACCOUNT</Text>
          </Pressable>
        </View>
      )}

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
          const selected = favorite === r.id;
          return (
            <Pressable
              key={r.id}
              style={[styles.favItem, selected && styles.favItemSelected]}
              onPress={() => chooseFavorite(r.id)}
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

      {/* settings (only when logged in) */}
      {session && (
        <>
          <Text style={[styles.section, { marginTop: 24 }]}>SETTINGS</Text>

          <View style={styles.accountCard}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>USERNAME</Text>
              <Text style={styles.accountValue}>
                {account ? `@${account.username}` : "..."}
              </Text>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>EMAIL</Text>
              <Text style={styles.accountValue} numberOfLines={1}>
                {session.user.email}
              </Text>
            </View>
          </View>

          <Pressable style={styles.logout} onPress={() => setConfirmLogout(true)}>
            <Ionicons name="log-out" size={18} color="#f5c518" />
            <Text style={styles.logoutText}>LOG OUT</Text>
          </Pressable>
        </>
      )}

      <DarkAlert
        visible={confirmLogout}
        title="Log out?"
        message="You'll need your email and password to log back in."
        buttons={[
          { text: "Cancel", style: "cancel" },
          { text: "Log out", style: "destructive", onPress: logOut },
        ]}
        onClose={() => setConfirmLogout(false)}
      />
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
  nameRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  nameText: { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 1 },
  username: { color: "#f5c518", fontWeight: "700", marginTop: 4 },
  editBox: { alignItems: "center" },
  editButtons: { flexDirection: "row", marginTop: 10 },
  smallFilled: {
    backgroundColor: "#f5c518",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  smallFilledText: { color: "#0d0d0d", fontWeight: "800", fontSize: 12 },
  smallOutline: {
    borderWidth: 1,
    borderColor: "#f5c518",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  smallOutlineText: { color: "#f5c518", fontWeight: "800", fontSize: 12 },
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
  message: { color: "#ff6b6b", textAlign: "center", marginBottom: 16 },
  loginCard: {
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
    padding: 18,
    marginBottom: 24,
  },
  loginText: { color: "#ccc", textAlign: "center", marginVertical: 10, lineHeight: 20 },
  loginButton: {
    alignSelf: "stretch",
    backgroundColor: "#f5c518",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButtonText: { color: "#0d0d0d", fontWeight: "800", letterSpacing: 1 },
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
  accountCard: {
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  accountLabel: { color: "#888", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  accountValue: { color: "#fff", fontWeight: "700", flexShrink: 1, marginLeft: 16 },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f5c518",
  },
  logoutText: { color: "#f5c518", fontWeight: "800", marginLeft: 8, letterSpacing: 1 },
});