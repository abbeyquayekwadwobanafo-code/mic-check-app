import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { loadRecent, timeLabel, type Message } from "../lib/chat";
import { loadBlockedIds, loadOverview, type PersonRow } from "../lib/friends";
import { supabase } from "../lib/supabase";
import { getSeen } from "../utils/seen";
import RapperAvatar from "./RapperAvatar";

type Row = { person: PersonRow; last: Message | null; unread: boolean };

// The gold bar shown when you have new friend requests
function RequestsBanner({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  if (count <= 0) return null;
  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <Ionicons name="people" size={20} color="#0d0d0d" />
      <Text style={styles.bannerText}>
        {count === 1 ? "1 new friend request" : `${count} new friend requests`}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#0d0d0d" />
    </Pressable>
  );
}

// Shown when you have no friends yet
function EmptyState({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="people" size={44} color="#f5c518" />
      </View>
      <Text style={styles.emptyTitle}>FIND YOUR PEOPLE</Text>
      <Text style={styles.emptyText}>
        Add friends to chat, trade quiz scores, and see who really knows the
        bars.
      </Text>
      <Pressable style={styles.emptyButton} onPress={onPress}>
        <Text style={styles.emptyButtonText}>FIND FRIENDS</Text>
      </Pressable>
    </View>
  );
}

export default function Inbox({
  myId,
  onOpenFriends,
  onOpenChat,
}: {
  myId: string;
  onOpenFriends: () => void;
  onOpenChat: (person: PersonRow) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [requests, setRequests] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [overview, recent, seen, blocked] = await Promise.all([
        loadOverview(myId),
        loadRecent(),
        getSeen(),
        loadBlockedIds(),
      ]);

      // The newest message for each friend (recent is already newest first)
      const lastBy = new Map<string, Message>();
      for (const m of recent) {
        const other = m.sender === myId ? m.recipient : m.sender;
        if (!lastBy.has(other)) lastBy.set(other, m);
      }

      const list: Row[] = overview.friends
        .filter((f) => !blocked.includes(f.person.id))
        .map((f) => {
          const last = lastBy.get(f.person.id) ?? null;
          const seenAt = seen[f.person.id];
          const unread =
            !!last &&
            last.sender !== myId &&
            (!seenAt ||
              new Date(last.created_at).getTime() > new Date(seenAt).getTime());
          return { person: f.person, last, unread };
        });

      list.sort((a, b) => {
        if (a.last && b.last) {
          return (
            new Date(b.last.created_at).getTime() -
            new Date(a.last.created_at).getTime()
          );
        }
        if (a.last) return -1;
        if (b.last) return 1;
        return a.person.username.localeCompare(b.person.username);
      });

      setRows(list);
      setRequests(overview.incoming.length);
      setError("");
    } catch {
      setError("Couldn't load. Check your internet.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [myId]);

  // Reload whenever you come back to this screen (for example from a chat)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Live updates: new messages and friend requests
  useEffect(() => {
    supabase
      .from("profiles")
      .select("username")
      .eq("id", myId)
      .single()
      .then(({ data }) => {
        if (data) setUsername((data as { username: string }).username);
      });

    const channel = supabase
      .channel(`inbox-${myId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => load()
      )
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

  function renderRow({ item }: { item: Row }) {
    const name = item.person.display_name || item.person.username;
    const preview = item.last
      ? item.last.sender === myId
        ? `You: ${item.last.body}`
        : item.last.body
      : "Say hi and start a conversation";

    return (
      <Pressable style={styles.row} onPress={() => onOpenChat(item.person)}>
        <RapperAvatar id={item.person.favorite ?? "none"} name={name} size={54} />
        <View style={styles.rowText}>
          <View style={styles.rowTop}>
            <Text
              style={[styles.name, item.unread && styles.nameUnread]}
              numberOfLines={1}
            >
              {name}
            </Text>
            {item.last && (
              <Text style={[styles.time, item.unread && styles.timeUnread]}>
                {timeLabel(item.last.created_at)}
              </Text>
            )}
          </View>
          <View style={styles.rowBottom}>
            <Text
              style={[
                styles.preview,
                item.unread && styles.previewUnread,
                !item.last && styles.previewEmpty,
              ]}
              numberOfLines={1}
            >
              {preview}
            </Text>
            {item.unread && <View style={styles.dot} />}
          </View>
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f5c518" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>MESSAGES</Text>
          {username && <Text style={styles.subtitle}>Signed in as @{username}</Text>}
        </View>

        <Pressable style={styles.addButton} onPress={onOpenFriends} hitSlop={10}>
          <Ionicons name="person-add" size={20} color="#f5c518" />
          {requests > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{requests}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <FlatList<Row>
        data={rows}
        keyExtractor={(r) => r.person.id}
        renderItem={renderRow}
        contentContainerStyle={
          rows.length === 0 ? { flexGrow: 1 } : { paddingBottom: 24 }
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor="#f5c518"
            colors={["#f5c518"]}
          />
        }
        ListHeaderComponent={
          <RequestsBanner count={requests} onPress={onOpenFriends} />
        }
        ListEmptyComponent={<EmptyState onPress={onOpenFriends} />}
      />
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
  title: { color: "#f5c518", fontSize: 24, fontWeight: "900", letterSpacing: 3 },
  subtitle: { color: "#888", fontWeight: "700", marginTop: 2 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 44,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: "#e03a3a",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  error: { color: "#ff6b6b", marginHorizontal: 20, marginBottom: 8 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5c518",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bannerText: { flex: 1, color: "#0d0d0d", fontWeight: "800", marginLeft: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#161616",
  },
  rowText: { flex: 1, marginLeft: 14 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowBottom: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  name: { color: "#ddd", fontSize: 17, fontWeight: "700", flex: 1, marginRight: 8 },
  nameUnread: { color: "#fff", fontWeight: "900" },
  time: { color: "#666", fontSize: 12 },
  timeUnread: { color: "#f5c518", fontWeight: "800" },
  preview: { color: "#888", flex: 1, fontSize: 14 },
  previewUnread: { color: "#fff", fontWeight: "700" },
  previewEmpty: { color: "#555", fontStyle: "italic" },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f5c518",
    marginLeft: 10,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1c1c1c",
    borderWidth: 2,
    borderColor: "#f5c518",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#f5c518",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 20,
  },
  emptyText: { color: "#aaa", textAlign: "center", marginTop: 10, lineHeight: 21 },
  emptyButton: {
    marginTop: 24,
    backgroundColor: "#f5c518",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  emptyButtonText: { color: "#0d0d0d", fontWeight: "800", letterSpacing: 1 },
});