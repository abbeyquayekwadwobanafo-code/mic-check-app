import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export type DarkAlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DarkAlertButton[];
  onClose: () => void;
};

// A pop-up box that matches the app's dark theme
export default function DarkAlert({
  visible,
  title,
  message,
  buttons,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttons}>
            {buttons.map((b, i) => (
              <Pressable
                key={i}
                style={[
                  styles.button,
                  b.style === "destructive"
                    ? styles.destructive
                    : b.style === "cancel"
                    ? styles.cancel
                    : styles.primary,
                ]}
                onPress={() => {
                  onClose();
                  b.onPress?.();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    b.style === "destructive" && { color: "#fff" },
                    b.style === "cancel" && { color: "#f5c518" },
                  ]}
                >
                  {b.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: "#1c1c1c",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    padding: 22,
  },
  title: {
    color: "#f5c518",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },
  message: { color: "#ccc", fontSize: 15, marginTop: 10, lineHeight: 21 },
  buttons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 22 },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    marginLeft: 10,
  },
  primary: { backgroundColor: "#f5c518" },
  destructive: { backgroundColor: "#c0392b" },
  cancel: { borderWidth: 1, borderColor: "#f5c518" },
  buttonText: { color: "#0d0d0d", fontWeight: "800", fontSize: 14 },
});