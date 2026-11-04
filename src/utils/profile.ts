import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "mic-check-profile";

export type Profile = { name: string; favorite: string | null };

const EMPTY: Profile = { name: "", favorite: null };

export async function getProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Profile>) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export async function saveProfile(profile: Profile) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}