import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

type Mode = "login" | "signup";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ageOk, setAgeOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setInfo("");
  }

  async function submit() {
    setError("");
    setInfo("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    const name = username.trim().toLowerCase();
    if (mode === "signup") {
      if (!/^[a-z0-9_]{3,20}$/.test(name)) {
        setError(
          "Username must be 3 to 20 characters: letters, numbers and underscores only."
        );
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (!ageOk) {
        setError("Please confirm that you are 13 or older.");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (err) setError(err.message);
      } else {
        const { data: free, error: rpcErr } = await supabase.rpc(
          "username_available",
          { p_username: name }
        );
        if (rpcErr) {
          setError("Couldn't check the username. Check your internet and try again.");
          return;
        }
        if (!free) {
          setError("That username is taken. Try another.");
          return;
        }

        const { data, error: err } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: name,
              display_name: displayName.trim().slice(0, 20),
            },
          },
        });
        if (err) setError(err.message);
        else if (!data.session) {
          setInfo("Account created. Check your email to confirm it, then log in.");
        }
      }
    } catch {
      setError("Couldn't connect. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  }

  const signup = mode === "signup";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Ionicons name="chatbubbles" size={56} color="#f5c518" />
        <Text style={styles.title}>{signup ? "JOIN THE CREW" : "WELCOME BACK"}</Text>
        <Text style={styles.subtitle}>
          {signup
            ? "Create an account to add friends and chat."
            : "Log in to chat with your friends."}
        </Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        {signup && (
          <>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username (letters, numbers, _)"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name (optional)"
              placeholderTextColor="#666"
              maxLength={20}
            />
          </>
        )}

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={setPassword}
            placeholder={signup ? "Password (8+ characters)" : "Password"}
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showPassword}
          />
          <Pressable
            style={styles.eye}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={10}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#888"
            />
          </Pressable>
        </View>

        {signup && (
          <Pressable style={styles.ageRow} onPress={() => setAgeOk(!ageOk)}>
            <Ionicons
              name={ageOk ? "checkbox" : "square-outline"}
              size={24}
              color={ageOk ? "#f5c518" : "#888"}
            />
            <Text style={styles.ageText}>I am 13 years old or older</Text>
          </Pressable>
        )}

        {error !== "" && <Text style={styles.error}>{error}</Text>}
        {info !== "" && <Text style={styles.info}>{info}</Text>}

        <Pressable
          style={[styles.button, busy && { opacity: 0.6 }]}
          onPress={submit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#0d0d0d" />
          ) : (
            <Text style={styles.buttonText}>{signup ? "CREATE ACCOUNT" : "LOG IN"}</Text>
          )}
        </Pressable>

        <Pressable onPress={switchMode} style={styles.switch}>
          <Text style={styles.switchText}>
            {signup
              ? "Already have an account? Log in"
              : "New here? Create an account"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0d0d0d" },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#f5c518",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 12,
  },
  subtitle: { color: "#aaa", marginTop: 6, marginBottom: 24, textAlign: "center" },
  input: {
    alignSelf: "stretch",
    backgroundColor: "#1c1c1c",
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 12,
  },
  passwordRow: { alignSelf: "stretch", justifyContent: "center" },
  passwordInput: { paddingRight: 48 },
  eye: { position: "absolute", right: 14, top: 14 },
  ageRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ageText: { color: "#ccc", marginLeft: 10 },
  error: { color: "#ff6b6b", alignSelf: "stretch", marginBottom: 12 },
  info: { color: "#1fd05a", alignSelf: "stretch", marginBottom: 12 },
  button: {
    alignSelf: "stretch",
    backgroundColor: "#f5c518",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#0d0d0d", fontWeight: "800", fontSize: 16, letterSpacing: 1 },
  switch: { marginTop: 18 },
  switchText: { color: "#f5c518", fontWeight: "700" },
});