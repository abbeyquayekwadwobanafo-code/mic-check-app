import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import FriendsPanel from "../../components/FriendsPanel";
import { useSession } from "../../lib/useSession";

export default function Messages() {
  const router = useRouter();
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f5c518" />
      </View>
    );
  }

  // Logged out: point people to the Profile tab to log in
  if (!session) {
    return (
      <View style={styles.center}>
        <Ionicons name="chatbubbles" size={64} color="#f5c518" />
        <Text style={styles.title}>MESSAGES</Text>
        <Text style={styles.text}>
          Log in to add friends and chat. You can create your account in the
          Profile tab.
        </Text>
        <Pressable style={styles.button} onPress={() => router.push("/profile")}>
          <Text style={styles.buttonText}>GO TO PROFILE</Text>
        </Pressable>
      </View>
    );
  }

  return <FriendsPanel myId={session.user.id} />;
}

const styles = StyleSheet.create({
  center: {
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
  text: { color: "#aaa", marginTop: 10, textAlign: "center", lineHeight: 21 },
  button: {
    marginTop: 24,
    backgroundColor: "#f5c518",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: { color: "#0d0d0d", fontWeight: "800", letterSpacing: 1 },
});