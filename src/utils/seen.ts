import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "mic-check-chat-seen";

// For each friend: when you last opened your chat with them (saved on this phone)
export type SeenMap = Record<string, string>;

export async function getSeen(): Promise<SeenMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    return {};
  }
}

export async function markSeen(friendId: string) {
  try {
    const all = await getSeen();
    all[friendId] = new Date().toISOString();
    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}