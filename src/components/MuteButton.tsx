import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusic } from "./MusicProvider";

export default function MuteButton() {
  const { muted, toggle } = useMusic();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={toggle}
      hitSlop={10}
      style={[styles.button, { top: insets.top + 6 }]}
    >
      <Ionicons
        name={muted ? "volume-mute" : "volume-high"}
        size={20}
        color="#f5c518"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(28,28,28,0.85)",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
});