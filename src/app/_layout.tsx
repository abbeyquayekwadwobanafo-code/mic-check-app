import { Stack } from "expo-router";
import { View } from "react-native";
import MusicProvider from "../components/MusicProvider";
import MuteButton from "../components/MuteButton";

export default function Layout() {
  return (
    <MusicProvider>
      <View style={{ flex: 1, backgroundColor: "#0d0d0d" }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0d0d0d" },
            animation: "fade",
          }}
        />
        <MuteButton />
      </View>
    </MusicProvider>
  );
}