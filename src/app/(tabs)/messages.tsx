import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AuthForm from "../../components/AuthForm";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../lib/useSession";
type Me = { username: string; display_name: string };

export default function Messages() {
  const { session, loading } = useSession();
  const [me, setMe] = useState<Me | null>(null);

  // Load your username and display name once you're logged in
  useEffect(() => {
    if (!session) {
      setMe(null);
      return;
    }
    supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (data) setMe(data as Me);
      });
  }, [session?.user.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f5c518" />
      </View>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <View style={styles.center}>
      <Ionicons name="person-circle" size={72} color="#f5c518" />
      <Text style={styles.name}>
        {me?.display_name ? me.display_name : me ? `@${me.username}` : "..."}
      </Text>
      {me && <Text style={styles.username}>@{me.username}</Text>}

      <Text style={styles.soon}>
        You're logged in. Friends and chats are coming next.
      </Text>

      <Pressable style={styles.logout} onPress={() => supabase.auth.signOut()}>
        <Ionicons name="log-out" size={18} color="#f5c518" />
        <Text style={styles.logoutText}>LOG OUT</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  name: { color: "#fff", fontSize: 26, fontWeight: "900", marginTop: 12 },
  username: { color: "#f5c518", fontWeight: "700", marginTop: 4 },
  soon: { color: "#aaa", textAlign: "center", marginTop: 24 },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f5c518",
  },
  logoutText: { color: "#f5c518", fontWeight: "800", marginLeft: 8, letterSpacing: 1 },
});