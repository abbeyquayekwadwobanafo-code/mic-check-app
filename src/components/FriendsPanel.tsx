import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  acceptRequest,
  blockPerson,
  loadBlockedIds,
  loadOverview,
  removeFriendship,
  searchPeople,
  sendRequest,
  type FriendRow,
  type Overview,
  type PersonRow,
} from "../lib/friends";
import { supabase } from "../lib/supabase";
import RapperAvatar from "./RapperAvatar";

type Tab = "friends" | "requests" | "find";
const EMPTY: Overview = { friends: [], incoming: [], outgoing: [] };

function Person({
  person,
  onPress,
  children,
}: {
  person: PersonRow;
  onPress?: () => void;
  children?: ReactNode;
}) {
  const name = person.display_name || person.username;
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <RapperAvatar id={person.favorite ?? "none"} name={name} size={44} />
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{name}</Text>
        <Text style={styles.rowUser}>@{person.username}</Text>
      </View>
      {children}
    </Pressable>
  );
}

function MiniButton({
  label,
  onPress,
  outline,
}: {
  label: string;
  onPress: () => void;
  outline?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.mini, outline ? styles.miniOutline : styles.miniFilled]}
    >
      <Text style={[styles.miniText, outline && { color: "#f5c518" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function FriendsPanel({
  myId,
  onBack,
  onOpenChat,
}: {
  myId: string;
  onBack?: () => void;
  onOpenChat?: (person: PersonRow) => void;
}) {
  const [tab, setTab] = useState<Tab>("friends");
  const [me, setMe] = useState<{ username: string; display_name: string } | null>(null);
  const [overview, setOverview] = useState<Overview>(EMPTY);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [o, b] = await Promise.all([loadOverview(myId), loadBlockedIds()]);
      setOverview(o);
      setBlocked(b);
      setMessage("");
    } catch {
      setMessage("Couldn't load. Check your internet.");
    } finally {
      setLoading(false);
    }
  }, [myId]);

  // Load your profile, your lists, and listen for live changes
  useEffect(() => {
    supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", myId)
      .single()
      .then(({ data }) => {
        if (data) setMe(data as { username: string; display_name: string });
      });

    load();

    const channel = supabase
      .channel(`friendships-${myId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, load]);

  // Search as you type (after a short pause)
  useEffect(() => {
    if (tab !== "find") return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        setResults(await searchPeople(myId, q));
      } catch {
        setMessage("Search failed. Check your internet.");
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, tab, myId]);

  async function run(action: () => Promise<void>) {
    try {
      await action();
      setMessage("");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  function confirmBlock(row: FriendRow) {
    Alert.alert(
      "Block this person?",
      "They won't be able to message you or send you friend requests.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () =>
            run(() => blockPerson(myId, row.person.id, row.friendshipId)),
        },
      ]
    );
  }

  function friendOptions(row: FriendRow) {
    Alert.alert(row.person.display_name || `@${row.person.username}`, undefined, [
      {
        text: "Remove friend",
        onPress: () => run(() => removeFriendship(row.friendshipId)),
      },
      { text: "Block", style: "destructive", onPress: () => confirmBlock(row) },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function statusOf(id: string) {
    if (overview.friends.some((f) => f.person.id === id)) return "friend";
    if (overview.outgoing.some((f) => f.person.id === id)) return "sent";
    if (overview.incoming.some((f) => f.person.id === id)) return "received";
    return "none";
  }

  const shownResults = results.filter((p) => !blocked.includes(p.id));
  const requestCount = overview.incoming.length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f5c518" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* header */}
      <View style={styles.header}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#1c1c1c",
              borderWidth: 1,
              borderColor: "#333",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#f5c518" />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>FRIENDS</Text>
          {me && (
            <Text style={styles.headerUser}>Signed in as @{me.username}</Text>
          )}
        </View>
      </View>

      {/* tabs */}
      <View style={styles.tabs}>
        {(["friends", "requests", "find"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.toUpperCase()}
            </Text>
            {t === "requests" && requestCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{requestCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {message !== "" && <Text style={styles.message}>{message}</Text>}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "friends" && (
          <>
            {overview.friends.length === 0 && (
              <Text style={styles.empty}>
                No friends yet. Open FIND to search for a username.
              </Text>
            )}
            {overview.friends.map((row) => (
              <Person
                key={row.friendshipId}
                person={row.person}
                onPress={() => onOpenChat?.(row.person)}
              >
                <Pressable onPress={() => friendOptions(row)} hitSlop={12}>
                  <Ionicons name="ellipsis-horizontal" size={22} color="#888" />
                </Pressable>
              </Person>
            ))}
          </>
        )}

        {tab === "requests" && (
          <>
            <Text style={styles.section}>RECEIVED</Text>
            {overview.incoming.length === 0 && (
              <Text style={styles.empty}>No new requests.</Text>
            )}
            {overview.incoming.map((row) => (
              <Person key={row.friendshipId} person={row.person}>
                <MiniButton
                  label="Accept"
                  onPress={() => run(() => acceptRequest(row.friendshipId))}
                />
                <MiniButton
                  label="Decline"
                  outline
                  onPress={() => run(() => removeFriendship(row.friendshipId))}
                />
              </Person>
            ))}

            <Text style={[styles.section, { marginTop: 24 }]}>SENT</Text>
            {overview.outgoing.length === 0 && (
              <Text style={styles.empty}>No pending requests.</Text>
            )}
            {overview.outgoing.map((row) => (
              <Person key={row.friendshipId} person={row.person}>
                <MiniButton
                  label="Cancel"
                  outline
                  onPress={() => run(() => removeFriendship(row.friendshipId))}
                />
              </Person>
            ))}
          </>
        )}

        {tab === "find" && (
          <>
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Search by username"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching && <ActivityIndicator color="#f5c518" />}
            {!searching && query.trim().length >= 2 && shownResults.length === 0 && (
              <Text style={styles.empty}>No one found.</Text>
            )}
            {shownResults.map((p) => {
              const status = statusOf(p.id);
              const incomingRow = overview.incoming.find(
                (f) => f.person.id === p.id
              );
              return (
                <Person key={p.id} person={p}>
                  {status === "friend" && (
                    <Text style={styles.statusText}>Friends</Text>
                  )}
                  {status === "sent" && (
                    <Text style={styles.statusText}>Requested</Text>
                  )}
                  {status === "received" && incomingRow && (
                    <MiniButton
                      label="Accept"
                      onPress={() =>
                        run(() => acceptRequest(incomingRow.friendshipId))
                      }
                    />
                  )}
                  {status === "none" && (
                    <MiniButton
                      label="Add"
                      onPress={() => run(() => sendRequest(myId, p.id))}
                    />
                  )}
                </Person>
              );
            })}
          </>
        )}
      </ScrollView>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerName: {
    color: "#f5c518",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 3,
  },
  headerUser: { color: "#888", fontWeight: "700", marginTop: 2 },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabActive: { backgroundColor: "#f5c518" },
  tabText: { color: "#888", fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  tabTextActive: { color: "#0d0d0d" },
  badge: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: "#e03a3a",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  message: { color: "#ff6b6b", marginHorizontal: 20, marginTop: 10 },
  section: { color: "#f5c518", fontWeight: "800", letterSpacing: 3, marginBottom: 10 },
  empty: { color: "#888", marginBottom: 14, textAlign: "center", marginTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  rowText: { flex: 1, marginLeft: 12 },
  rowName: { color: "#fff", fontSize: 16, fontWeight: "800" },
  rowUser: { color: "#888", marginTop: 2 },
  mini: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  miniFilled: { backgroundColor: "#f5c518" },
  miniOutline: { borderWidth: 1, borderColor: "#f5c518" },
  miniText: { color: "#0d0d0d", fontWeight: "800", fontSize: 13 },
  statusText: { color: "#888", fontWeight: "700" },
  search: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 14,
  },
});