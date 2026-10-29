import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MIC CHECK</Text>
      <Text style={styles.tagline}>How well do you know the bars?</Text>

      <Pressable style={styles.button} onPress={() => router.push("/rappers")}>
        <Text style={styles.buttonText}>START</Text>
      </Pressable>
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
});