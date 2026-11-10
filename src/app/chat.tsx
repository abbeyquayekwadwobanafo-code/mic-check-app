import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DarkAlert, { type DarkAlertButton } from "../components/DarkAlert";
import RapperAvatar from "../components/RapperAvatar";
import {
  blockAndUnfriend,
  clockTime,
  loadConversation,
  reportUser,
  sendMessage,
  type Message,
} from "../lib/chat";
import type { PersonRow } from "../lib/friends";
import { supabase } from "../lib/supabase";
import { useSession } from "../lib/useSession";
import { markSeen } from "../utils/seen";

type DialogState = {
  title: string;
  message?: string;
  buttons: DarkAlertButton[];
};

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, mine && { color: "#0d0d0d" }]}>
          {message.body}
        </Text>
        <Text style={[styles.bubbleTime, mine && { color: "rgba(13,13,13,0.55)" }]}>
          {clockTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { friend: friendId } = useLocalSearchParams<{ friend: string }>();
  const { session } = useSession();
  const myId = session?.user.id;

  const [friend, setFriend] = useState<PersonRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // newest first
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track the keyboard so the message box can sit just above it
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Adds a message to the top of the list (ignores ones we already have)
  const addMessage = useCallback((m: Message) => {
    setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [m, ...prev]));
  }, []);

  useEffect(() => {
    if (!myId || !friendId) return;

    supabase
      .from("profiles")
      .select("id, username, display_name, favorite")
      .eq("id", friendId)
      .single()
      .then(({ data }) => {
        if (data) setFriend(data as PersonRow);
      });

    loadConversation(myId, friendId)
      .then(setMessages)
      .catch(() => setError("Couldn't load messages. Check your internet."))
      .finally(() => setLoading(false));

    markSeen(friendId);

    // Live: new messages between the two of you appear instantly
    const channel = supabase
      .channel(`chat-${myId}-${friendId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as Message;
          const between =
            (m.sender === myId && m.recipient === friendId) ||
            (m.sender === friendId && m.recipient === myId);
          if (!between) return;
          addMessage(m);
          if (m.sender === friendId) markSeen(friendId);
        }
      )
      .subscribe();

    return () => {
      markSeen(friendId);
      supabase.removeChannel(channel);
    };
  }, [myId, friendId, addMessage]);

  async function send() {
    const body = text.trim();
    if (!body || !myId || !friendId || sending) return;
    setSending(true);
    setError("");
    try {
      const m = await sendMessage(myId, friendId, body);
      addMessage(m);
      setText("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send.");
    } finally {
      setSending(false);
    }
  }

  const name = friend ? friend.display_name || friend.username : "...";

  async function doReport() {
    if (!myId || !friendId) return;
    try {
      await reportUser(myId, friendId);
      setDialog({
        title: "Report sent",
        message: "Thanks for letting us know.",
        buttons: [{ text: "OK" }],
      });
    } catch {
      setDialog({
        title: "Couldn't send the report",
        message: "Check your internet and try again.",
        buttons: [{ text: "OK" }],
      });
    }
  }

  function confirmBlock() {
    setDialog({
      title: `Block ${name}?`,
      message:
        "You won't be able to message each other, and they'll be removed from your friends.",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            if (!myId || !friendId) return;
            try {
              await blockAndUnfriend(myId, friendId);
              router.back();
            } catch {
              setError("Couldn't block this person.");
            }
          },
        },
      ],
    });
  }

  function openMenu() {
    setDialog({
      title: name,
      message: "What would you like to do? Tap outside to close.",
      buttons: [
        { text: "Report", onPress: doReport },
        { text: "Block", style: "destructive", onPress: confirmBlock },
      ],
    });
  }

  if (!myId || !friendId) {
    return <View style={styles.screen} />;
  }

  // When the keyboard is open, lift the message box above it
  const bottomPadding =
    keyboardHeight > 0 ? keyboardHeight + 8 : Math.max(insets.bottom, 10);

  return (
    <View style={styles.screen}>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <RapperAvatar id={friend?.favorite ?? "none"} name={name} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.headerName} numberOfLines={1}>
            {name}
          </Text>
          {friend && <Text style={styles.headerUser}>@{friend.username}</Text>}
        </View>
      </View>

      <Pressable
        style={[styles.menuButton, { top: insets.top + 6 }]}
        onPress={openMenu}
        hitSlop={10}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#f5c518" />
      </Pressable>

      {/* messages */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#f5c518" />
        </View>
      ) : (
        <FlatList
          data={messages}
          inverted
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Bubble message={item} mine={item.sender === myId} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="chatbubble-ellipses" size={48} color="#f5c518" />
              <Text style={styles.emptyTitle}>SAY HI</Text>
              <Text style={styles.emptyText}>
                This is the start of your chat with {name}.
              </Text>
            </View>
          }
        />
      )}

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      {/* message box */}
      <View style={[styles.composer, { paddingBottom: bottomPadding }]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        <Pressable
          style={[styles.send, (!text.trim() || sending) && { opacity: 0.4 }]}
          onPress={send}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="arrow-up" size={22} color="#0d0d0d" />
        </Pressable>
      </View>

      <DarkAlert
        visible={dialog !== null}
        title={dialog?.title ?? ""}
        message={dialog?.message}
        buttons={dialog?.buttons ?? []}
        onClose={() => setDialog(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d0d0d" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    paddingLeft: 64,
    paddingRight: 104,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
  },
  headerText: { marginLeft: 12, flex: 1 },
  headerName: { color: "#fff", fontSize: 17, fontWeight: "900" },
  headerUser: { color: "#888", fontSize: 12, marginTop: 1 },
  menuButton: {
    position: "absolute",
    right: 60,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(28,28,28,0.85)",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleRow: { flexDirection: "row", marginBottom: 8 },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 6,
    borderRadius: 18,
  },
  bubbleMine: { backgroundColor: "#f5c518", borderBottomRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: "#fff", fontSize: 16, lineHeight: 22 },
  bubbleTime: { color: "#777", fontSize: 10, marginTop: 3, alignSelf: "flex-end" },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 48,
    transform: [{ scaleY: -1 }], // flipped back, because the list is upside down
  },
  emptyTitle: {
    color: "#f5c518",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 12,
  },
  emptyText: { color: "#888", marginTop: 6, textAlign: "center" },
  error: { color: "#ff6b6b", marginHorizontal: 16, marginBottom: 6 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1c1c1c",
    backgroundColor: "#0d0d0d",
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: "#1c1c1c",
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5c518",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});