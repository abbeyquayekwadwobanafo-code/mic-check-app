import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type Rank = {
  name: string;
  min: number; // minimum percentage needed for this rank
  color: string;
  icon: IconName;
  line: string;
};

export const RANKS: Rank[] = [
  { name: "SOUND CHECK", min: 0, color: "#8a8a8a", icon: "mic-off", line: "Is this thing on? Run it back." },
  { name: "OPEN MIC", min: 20, color: "#cd7f32", icon: "mic", line: "You're on the stage. Keep grinding." },
  { name: "MIXTAPE", min: 40, color: "#c0c0c0", icon: "disc", line: "Solid bars. Not a classic yet." },
  { name: "UNDERGROUND", min: 60, color: "#4db6ff", icon: "headset", line: "The streets know your name." },
  { name: "HEADLINER", min: 75, color: "#f5c518", icon: "star", line: "Crowd's on its feet. Respect." },
  { name: "HALL OF FAME", min: 90, color: "#ff9d1a", icon: "trophy", line: "Certified legend. Almost flawless." },
  { name: "G.O.A.T.", min: 100, color: "#00e5ff", icon: "diamond", line: "Perfect score. Nobody does it better." },
];

export function getRank(pct: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (pct >= r.min) current = r;
  }
  return current;
}