import { supabase } from "./supabase";

export type Message = {
  id: number;
  sender: string;
  recipient: string;
  body: string;
  created_at: string;
};

const FIELDS = "id, sender, recipient, body, created_at";

// The last 100 messages between you and one friend, newest first
export async function loadConversation(
  myId: string,
  friendId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(FIELDS)
    .or(
      `and(sender.eq.${myId},recipient.eq.${friendId}),and(sender.eq.${friendId},recipient.eq.${myId})`
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as Message[];
}

// Your latest messages with everyone, newest first (the security rules only
// return messages you sent or received)
export async function loadRecent(): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(FIELDS)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(
  myId: string,
  friendId: string,
  body: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender: myId, recipient: friendId, body: body.trim().slice(0, 500) })
    .select(FIELDS)
    .single();
  if (error || !data) {
    throw new Error("Couldn't send. Check your internet, and that you're still friends.");
  }
  return data as Message;
}

export async function reportUser(myId: string, otherId: string) {
  const { error } = await supabase.from("reports").insert({
    reporter: myId,
    reported: otherId,
    reason: "Reported from a chat",
  });
  if (error) throw new Error("Couldn't send the report.");
}

export async function blockAndUnfriend(myId: string, otherId: string) {
  const { error } = await supabase
    .from("blocks")
    .insert({ blocker: myId, blocked: otherId });
  if (error && error.code !== "23505") {
    throw new Error("Couldn't block this person.");
  }
  await supabase
    .from("friendships")
    .delete()
    .or(
      `and(requester.eq.${myId},addressee.eq.${otherId}),and(requester.eq.${otherId},addressee.eq.${myId})`
    );
}

// "14:05"
export function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "14:05", "Yesterday", or "8 Nov"
export function timeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return clockTime(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}