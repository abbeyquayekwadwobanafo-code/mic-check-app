import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "mic-check-best-scores";

export type Best = { score: number; total: number };
export type Scores = Record<string, Best>;

export async function getAllBest(): Promise<Scores> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Scores) : {};
  } catch {
    return {};
  }
}

// Saves the score if it beats the old best. Returns true if it was a new best.
export async function saveScore(
  rapperId: string,
  category: string,
  score: number,
  total: number
): Promise<boolean> {
  try {
    const all = await getAllBest();
    const id = `${rapperId}:${category}`;
    const old = all[id];
    const isBest = !old || score / total > old.score / old.total;
    if (isBest) {
      all[id] = { score, total };
      await AsyncStorage.setItem(KEY, JSON.stringify(all));
    }
    return isBest;
  } catch {
    return false;
  }
}