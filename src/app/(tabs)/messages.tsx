import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function Messages() {
  return (
    <View style={styles.container}>
      <Ionicons name="chatbubbles" size={64} color="#f5c518" />
      <Text style={styles.title}>MESSAGES</Text>
      <Text style={styles.text}>Chat with your brothers is coming soon.</Text>
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
    color: "#f5c518",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 16,
  },
  text: { color: "#aaa", marginTop: 8, textAlign: "center" },
});