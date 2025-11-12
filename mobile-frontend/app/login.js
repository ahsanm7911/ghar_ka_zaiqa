import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import * as Animatable from "react-native-animatable";
import api from "../utils/api";
import { getAuthData, saveAuthData } from "../utils/auth";
import theme from "../utils/theme";
import { showErrorToast, showSuccessToast } from "../utils/toast";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { token, userType } = await getAuthData();
            if (token && userType) {
                router.replace(userType === "chef" ? "/chef-dashboard" : "/customer-dashboard");
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async () => {
        if(!email || !password) {
            showErrorToast("Email or password missing!");
            return
        }
        setLoading(true);
        try {
            const response = await api.post("accounts/login/", { email, password });

            // If the request succeeds (status 200)
            const { token, user } = response.data;
            await saveAuthData(token, JSON.stringify(user), user.user_type);
            
            showSuccessToast("Welcome back!")
            // Redirect based on user type
            router.replace(user.user_type === "chef" ? "/chef-dashboard" : user.user_type === 'customer' ? "/customer-dashboard" : '/admin-dashboard');

        } catch (error) {
            console.log("Login error:", error.response?.data);

            // Extract error message from backend
            const backendMessage = error.response?.data?.detail || "";

            if (backendMessage.includes("account not activated or disabled.")) {
                // Redirect to activation screen
                router.replace("/account-not-activated");
            } 

            // Handle other backend validation errors
            if (error.response?.status === 400) {
                showErrorToast("Invalid email or password.")
            } else if (error.response?.status === 403) {
                showErrorToast("Your account is disabled or not yet activated.");
            } else {
                // Catch-all for network/server issues
                showErrorToast("Something went wrong. Please try again later.");
            }

        } finally {
            setLoading(false);
        }

    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.warmBeige }]}>
            <Animatable.Text
                animation="fadeInDown"
                duration={1000}
                style={[styles.title, { color: theme.colors.charcoalGray }]}
            >
                Welcome Back
            </Animatable.Text>

            <Animatable.View animation="fadeInUp" duration={1000} style={styles.formContainer}>
                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    disabled={loading}
                    style={[
                        styles.button,
                        {
                            backgroundColor: loading
                                ? theme.colors.softGray
                                : theme.colors.rusticOrange,
                        },
                    ]}
                    onPress={handleLogin}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.creamyWhite} />
                    ) : (
                        <Text style={[styles.buttonText, { color: theme.colors.creamyWhite }]}>
                            Login
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("/signup")}>
                    <Text style={[styles.link, { color: theme.colors.rusticOrange }]}>
                        Don’t have an account? Sign up
                    </Text>
                </TouchableOpacity>
            </Animatable.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    formContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 12, elevation: 2 },
    input: {
        borderWidth: 1,
        borderColor: "#E5E5E5",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
    },
    button: { padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
    buttonText: { fontWeight: "bold", fontSize: 16 },
    link: { textAlign: "center", marginTop: 15, fontWeight: "500" },
});
