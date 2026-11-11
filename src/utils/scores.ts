import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

// Scores and stats are saved per account on this phone.
// Before you log in, they live under the plain "guest" keys.
const KEY = "mic-check-best-scores";
const STATS_KEY = "mic-check-stats";

export type Best = { score: number; total: number };
export type Scores = Record<string, Best>;
export type Stats = { played: number; correct: number; answered: number };

const EMPTY_STATS: Stats = { played: 0, correct: 0, answered: 0 };

// Only "All questions" boards go on the leaderboard, for example "nas:All"
// or "mixed:All-timed"
const BOARD = /^[a-z0-9_]{2,20}:All(-timed)?$/;

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

function scoresKey(userId: string | null) {
  return userId ? `${KEY}:${userId}` : KEY;
}

function statsKey(userId: string | null) {
  return userId ? `${STATS_KEY}:${userId}` : STATS_KEY;
}

// The first time an account is used on this phone, it copies the guest progress
async function adoptGuestProgress(userId: string) {
  try {
    if ((await AsyncStorage.getItem(scoresKey(userId))) === null) {
      const guest = await AsyncStorage.getItem(KEY);
      if (guest !== null) await AsyncStorage.setItem(scoresKey(userId), guest);
    }
    if ((await AsyncStorage.getItem(statsKey(userId))) === null) {
      const guest = await AsyncStorage.getItem(STATS_KEY);
      if (guest !== null) await AsyncStorage.setItem(statsKey(userId), guest);
    }
  } catch {
    // ignore
  }
}

export async function getAllBest(): Promise<Scores> {
  try {
    const userId = await currentUserId();
    if (userId) await adoptGuestProgress(userId);
    const raw = await AsyncStorage.getItem(scoresKey(userId));
    return raw ? (JSON.parse(raw) as Scores) : {};
  } catch {
    return {};
  }
}

export async function getStats(): Promise<Stats> {
  try {
    const userId = await currentUserId();
    if (userId) await adoptGuestProgress(userId);
    const raw = await AsyncStorage.getItem(statsKey(userId));
    return raw
      ? { ...EMPTY_STATS, ...(JSON.parse(raw) as Partial<Stats>) }
      : { ...EMPTY_STATS };
  } catch {
    return { ...EMPTY_STATS };
  }
}

// Sends scores to the leaderboard. The database only keeps a score if it
// beats your old one.
async function pushScores(userId: string, entries: Scores) {
  const rows = Object.entries(entries)
    .filter(([board, s]) => BOARD.test(board) && s.total >= 5)
    .map(([board, s]) => ({
      user_id: userId,
      board,
      score: s.score,
      total: s.total,
    }));
  if (rows.length === 0) return;
  await supabase.from("scores").upsert(rows, { onConflict: "user_id,board" });
}

// Sends all your best "All questions" scores to the leaderboard
export async function syncBestScores() {
  try {
    const userId = await currentUserId();
    if (!userId) return;
    const all = await getAllBest();
    await pushScores(userId, all);
  } catch {
    // ignore (for example when offline)
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
    const userId = await currentUserId();
    if (userId) await adoptGuestProgress(userId);

    // quizzes played, correct answers, accuracy
    const rawStats = await AsyncStorage.getItem(statsKey(userId));
    const stats: Stats = rawStats
      ? { ...EMPTY_STATS, ...(JSON.parse(rawStats) as Partial<Stats>) }
      : { ...EMPTY_STATS };
    await AsyncStorage.setItem(
      statsKey(userId),
      JSON.stringify({
        played: stats.played + 1,
        correct: stats.correct + score,
        answered: stats.answered + total,
      })
    );

    // best score
    const raw = await AsyncStorage.getItem(scoresKey(userId));
    const all: Scores = raw ? (JSON.parse(raw) as Scores) : {};
    const id = `${rapperId}:${category}`;
    const old = all[id];
    const isBest = !old || score / total > old.score / old.total;

    if (isBest) {
      all[id] = { score, total };
      await AsyncStorage.setItem(scoresKey(userId), JSON.stringify(all));

      // new best on a leaderboard board: send it (without waiting)
      if (userId && BOARD.test(id)) {
        pushScores(userId, { [id]: { score, total } }).catch(() => {});
      }
    }
    return isBest;
  } catch {
    return false;
  }
}