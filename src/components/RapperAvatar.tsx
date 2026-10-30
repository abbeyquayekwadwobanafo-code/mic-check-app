import { Image, StyleSheet, Text, View } from "react-native";
import { rapperImages } from "../data/images";

function initials(name: string) {
  const words = name.split(/[\s-]+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function RapperAvatar({
  id,
  name,
  size = 64,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const image = rapperImages[id];
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (image) {
    return <Image source={image} style={[styles.image, circle]} />;
  }

  return (
    <View style={[styles.fallback, circle]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { borderWidth: 2, borderColor: "#f5c518" },
  fallback: {
    backgroundColor: "#2a2a2a",
    borderWidth: 2,
    borderColor: "#f5c518",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: "#f5c518", fontWeight: "900", letterSpacing: 1 },
});