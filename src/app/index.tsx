import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MicLogo from "../components/MicLogo";
import { rappers } from "../data/rappers";
import { isGuest } from "../lib/guest";
import { supabase } from "../lib/supabase";
import { ALLOW_GUEST } from "../utils/settings";

export default function Landing() {
  const router = useRouter();
  const total = rappers.reduce((sum, r) => sum + r.questions.length, 0);

  async function start() {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/home");
        return;
      }
      if (ALLOW_GUEST && (await isGuest())) {
        router.replace("/home");
        return;
      }
    } catch {
      // if anything goes wrong, fall through to the welcome screen
    }
    router.replace("/welcome");
  }

  return (
    <View style={styles.container}>
      <MicLogo />

      <Text style={styles.title}>MIC CHECK</Text>
      <Text style={styles.tagline}>How well do you know the bars?</Text>

      <Pressable style={styles.button} onPress={start}>
        <Text style={styles.buttonText}>START</Text>
      </Pressable>

      <Text style={styles.footer}>
        {rappers.length} artists · {total} questions
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "#f5c518",
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: "#aaaaaa",
    marginTop: 8,
    marginBottom: 48,
  },
  button: {
    backgroundColor: "#f5c518",
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0d0d0d",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    color: "#666",
    letterSpacing: 1,
  },
});