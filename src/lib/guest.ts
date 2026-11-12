import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "mic-check-guest";

// Remembers that someone chose "Continue as guest", so we don't ask again
export async function isGuest(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setGuest(on: boolean) {
  try {
    if (on) await AsyncStorage.setItem(KEY, "1");
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}