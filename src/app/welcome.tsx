import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthForm from "../components/AuthForm";
import { setGuest } from "../lib/guest";
import { useSession } from "../lib/useSession";
import { ALLOW_GUEST } from "../utils/settings";

export default function Welcome() {
  const router = useRouter();
  const { session } = useSession();
  const insets = useSafeAreaInsets();

  // As soon as you're logged in, go into the app
  useEffect(() => {
    if (session) {
      setGuest(false);
      router.replace("/home");
    }
  }, [session]);

  async function continueAsGuest() {
    await setGuest(true);
    router.replace("/home");
  }

  return (
    <View style={styles.screen}>
      <AuthForm />

      {ALLOW_GUEST && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable onPress={continueAsGuest} hitSlop={10}>
            <Text style={styles.guestText}>Continue as guest</Text>
          </Pressable>
          <Text style={styles.guestNote}>
            You can play the quizzes. Ranks and Messages need an account.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d0d0d" },
  footer: {
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "#1c1c1c",
  },
  guestText: {
    color: "#f5c518",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
  guestNote: { color: "#777", fontSize: 12, marginTop: 6, textAlign: "center" },
});