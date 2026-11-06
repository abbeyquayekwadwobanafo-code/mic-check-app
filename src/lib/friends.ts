import { supabase } from "./supabase";

export type PersonRow = { id: string; username: string; display_name: string };
export type FriendRow = { friendshipId: number; person: PersonRow };
export type Overview = {
  friends: FriendRow[];
  incoming: FriendRow[];
  outgoing: FriendRow[];
};

type Friendship = {
  id: number;
  requester: string;
  addressee: string;
  status: string;
};

// Loads your friends, requests you received, and requests you sent
export async function loadOverview(myId: string): Promise<Overview> {
  const { data: rows, error } = await supabase
    .from("friendships")
    .select("id, requester, addressee, status");
  if (error || !rows) throw error ?? new Error("No data");

  const list = rows as Friendship[];
  const otherIds = Array.from(
    new Set(list.map((f) => (f.requester === myId ? f.addressee : f.requester)))
  );

  let people: PersonRow[] = [];
  if (otherIds.length > 0) {
    const { data: p, error: pErr } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", otherIds);
    if (pErr) throw pErr;
    people = (p ?? []) as PersonRow[];
  }

  const byId = new Map(people.map((p) => [p.id, p]));
  const overview: Overview = { friends: [], incoming: [], outgoing: [] };

  for (const f of list) {
    const otherId = f.requester === myId ? f.addressee : f.requester;
    const person = byId.get(otherId);
    if (!person) continue;
    const row = { friendshipId: f.id, person };
    if (f.status === "accepted") overview.friends.push(row);
    else if (f.addressee === myId) overview.incoming.push(row);
    else overview.outgoing.push(row);
  }

  overview.friends.sort((a, b) =>
    a.person.username.localeCompare(b.person.username)
  );
  return overview;
}

// People you have blocked
export async function loadBlockedIds(): Promise<string[]> {
  const { data, error } = await supabase.from("blocks").select("blocked");
  if (error) throw error;
  return (data ?? []).map((r: { blocked: string }) => r.blocked);
}

// Finds people whose username starts with what you typed
export async function searchPeople(
  myId: string,
  query: string
): Promise<PersonRow[]> {
  const q = query
    .trim()
    .toLowerCase()
    .replace(/[\\%_]/g, (c) => "\\" + c);
  if (q.length < 2) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .ilike("username", `${q}%`)
    .neq("id", myId)
    .limit(20);
  if (error) throw error;
  return (data ?? []) as PersonRow[];
}

export async function sendRequest(myId: string, otherId: string) {
  const { error } = await supabase
    .from("friendships")
    .insert({ requester: myId, addressee: otherId });
  if (error) {
    if (error.code === "23505") {
      throw new Error("You already have a request or friendship with this person.");
    }
    throw new Error("Couldn't send the request.");
  }
}

export async function acceptRequest(friendshipId: number) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  if (error) throw new Error("Couldn't accept the request.");
}

// Used for declining, cancelling and unfriending
export async function removeFriendship(friendshipId: number) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
  if (error) throw new Error("Couldn't remove it.");
}

export async function blockPerson(
  myId: string,
  otherId: string,
  friendshipId?: number
) {
  const { error } = await supabase
    .from("blocks")
    .insert({ blocker: myId, blocked: otherId });
  if (error && error.code !== "23505") {
    throw new Error("Couldn't block this person.");
  }
  if (friendshipId !== undefined) {
    await supabase.from("friendships").delete().eq("id", friendshipId);
  }
}