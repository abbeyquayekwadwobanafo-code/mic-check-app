import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Ionicons name="person" size={64} color="#f5c518" />
      <Text style={styles.title}>PROFILE</Text>
      <Text style={styles.text}>Your profile and stats are coming soon.</Text>
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