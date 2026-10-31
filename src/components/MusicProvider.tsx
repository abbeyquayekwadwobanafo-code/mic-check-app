import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

const KEY = "mic-check-muted";
const MUSIC_VOLUME = 0.35; // 0 is silent, 1 is full volume
const source = require("../../assets/music/beat.mp3");

type MusicState = { muted: boolean; toggle: () => void };

const MusicContext = createContext<MusicState>({
  muted: false,
  toggle: () => {},
});

export function useMusic() {
  return useContext(MusicContext);
}

export default function MusicProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer(source);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  // Remember whether you muted the music last time
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => setMuted(v === "1"))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Let the beat play alongside other apps, and even in silent mode
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "mixWithOthers",
      interruptionModeAndroid: "duckOthers",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    player.loop = true;
    player.volume = MUSIC_VOLUME;
  }, [player]);

  // Play or pause when the mute choice changes
  useEffect(() => {
    if (!ready) return;
    if (muted) player.pause();
    else player.play();
  }, [muted, ready, player]);

  function toggle() {
    const next = !muted;
    setMuted(next);
    AsyncStorage.setItem(KEY, next ? "1" : "0").catch(() => {});
  }

  return (
    <MusicContext.Provider value={{ muted, toggle }}>
      {children}
    </MusicContext.Provider>
  );
}