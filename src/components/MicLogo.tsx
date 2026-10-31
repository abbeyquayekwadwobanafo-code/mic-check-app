import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, {
    Circle,
    ClipPath,
    Defs,
    G,
    Line,
    LinearGradient,
    Path,
    RadialGradient,
    Rect,
    Stop,
} from "react-native-svg";

// A ring that grows outward and fades, over and over
function Ring({ delay }: { delay: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.6],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.05, 1],
    outputRange: [0, 0.55, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { opacity, transform: [{ scale }] }]}
    />
  );
}

export default function MicLogo() {
  return (
    <View style={styles.wrap}>
      <Ring delay={0} />
      <Ring delay={1200} />

      <Svg width={150} height={165} viewBox="0 0 200 220">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#f5c518" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#f5c518" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#fff0a8" />
            <Stop offset="0.5" stopColor="#f5c518" />
            <Stop offset="1" stopColor="#a87a00" />
          </LinearGradient>
          <ClipPath id="head">
            <Rect x="65" y="15" width="70" height="110" rx="35" />
          </ClipPath>
        </Defs>

        {/* soft glow behind the mic */}
        <Circle cx="100" cy="85" r="100" fill="url(#glow)" />

        {/* mic head */}
        <Rect x="65" y="15" width="70" height="110" rx="35" fill="url(#gold)" />

        {/* mesh grille, clipped to the head shape */}
        <G clipPath="url(#head)">
          {[35, 51, 67, 83, 99, 115].map((y) => (
            <Line
              key={`h${y}`}
              x1="65"
              y1={y}
              x2="135"
              y2={y}
              stroke="#0d0d0d"
              strokeOpacity="0.4"
              strokeWidth="3"
            />
          ))}
          {[85, 100, 115].map((x) => (
            <Line
              key={`v${x}`}
              x1={x}
              y1="15"
              x2={x}
              y2="125"
              stroke="#0d0d0d"
              strokeOpacity="0.25"
              strokeWidth="2"
            />
          ))}
        </G>

        {/* holder arc, stem and base */}
        <Path
          d="M 50 85 C 50 150, 150 150, 150 85"
          stroke="url(#gold)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <Rect x="96" y="134" width="8" height="52" fill="url(#gold)" />
        <Rect x="58" y="184" width="84" height="12" rx="6" fill="url(#gold)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  ring: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#f5c518",
  },
});