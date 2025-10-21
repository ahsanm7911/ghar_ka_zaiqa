import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
import theme from "../utils/theme";

export default function AccountNotActivated() {
  const router = useRouter();

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={1000}
      style={[styles.container, { backgroundColor: theme.colors.warmBeige }]}
    >
      <Text style={styles.emoji}>❌</Text>
      <Text style={[styles.title, { color: theme.colors.charcoalGray }]}>
        Account Not Activated or Disabled
      </Text>
      <Text style={[styles.message, { color: theme.colors.charcoalGray }]}>
        Please check your email for an activation link to verify your account.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.rusticOrange }]}
        onPress={() => router.replace("/login")}
      >
        <Text style={[styles.buttonText, { color: theme.colors.creamyWhite }]}>
          Go to Login
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emoji: {
    fontSize: 70,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
