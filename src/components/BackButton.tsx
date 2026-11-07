import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DarkAlert from "./DarkAlert";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [confirm, setConfirm] = useState(false);

  // Only show on the category and quiz screens
  if (pathname !== "/categories" && pathname !== "/quiz") return null;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  }

  function onPress() {
    if (pathname === "/quiz") setConfirm(true);
    else goBack();
  }

  return (
    <>
      <Pressable
        onPress={onPress}
        hitSlop={10}
        style={[styles.button, { top: insets.top + 6 }]}
      >
        <Ionicons name="chevron-back" size={22} color="#f5c518" />
      </Pressable>

      <DarkAlert
        visible={confirm}
        title="Leave quiz?"
        message="Your progress in this quiz will be lost."
        buttons={[
          { text: "Stay", style: "cancel" },
          { text: "Leave", style: "destructive", onPress: goBack },
        ]}
        onClose={() => setConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    left: 16,
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