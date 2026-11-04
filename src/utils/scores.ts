import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "mic-check-best-scores";
const STATS_KEY = "mic-check-stats";

export type Best = { score: number; total: number };
export type Scores = Record<string, Best>;
export type Stats = { played: number; correct: number; answered: number };

const EMPTY_STATS: Stats = { played: 0, correct: 0, answered: 0 };

export async function getAllBest(): Promise<Scores> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Scores) : {};
  } catch {
    return {};
  }
}

export async function getStats(): Promise<Stats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    return raw
      ? { ...EMPTY_STATS, ...(JSON.parse(raw) as Partial<Stats>) }
      : { ...EMPTY_STATS };
  } catch {
    return { ...EMPTY_STATS };
  }
}

async function addToStats(score: number, total: number) {
  try {
    const s = await getStats();
    await AsyncStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        played: s.played + 1,
        correct: s.correct + score,
        answered: s.answered + total,
      })
    );
  } catch {
    // ignore
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
    await addToStats(score, total);
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