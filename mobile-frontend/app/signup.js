import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useRouter } from "expo-router";
import api from "../utils/api";
import theme from "../utils/theme";
import { showErrorToast, showSuccessToast, showInfoToast } from "../utils/toast";

export default function Signup() {
  const [userType, setUserType] = useState("customer");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    address: "",
    phone_number: "",
    dietary_preferences: "",
    bio: "",
    specialty: "",
    years_of_experience: "",
    certification: "",
  });

  const router = useRouter();

  const handleChange = (key, value) => setFormData({ ...formData, [key]: value });

  const handleSignup = async () => {
    setLoading(true);
    try {
      // Build payload based on user type
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        user_type: userType,
        ...(userType === "customer"
          ? {
              address: formData.address,
              phone_number: formData.phone_number,
              dietary_preferences: formData.dietary_preferences,
            }
          : {
              bio: formData.bio,
              specialty: formData.specialty,
              years_of_experience: formData.years_of_experience,
              certification: formData.certification,
            }),
      };

      const response = await api.post("accounts/signup/", payload);
      showInfoToast("Please check your email for activation link.");
      router.replace("/login");
    } catch (error) {
      console.error(error.response?.data);
      showErrorToast("Please enter all fields or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerFields = () => (
    <>
      <TextInput
        placeholder="Address"
        style={styles.input}
        value={formData.address}
        onChangeText={(value) => handleChange("address", value)}
      />
      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        value={formData.phone_number}
        onChangeText={(value) => handleChange("phone_number", value)}
      />
      <TextInput
        placeholder="Dietary Preferences"
        style={styles.input}
        value={formData.dietary_preferences}
        onChangeText={(value) => handleChange("dietary_preferences", value)}
      />
    </>
  );

  const renderChefFields = () => (
    <>
      <TextInput
        placeholder="Bio"
        style={styles.input}
        value={formData.bio}
        onChangeText={(value) => handleChange("bio", value)}
      />
      <TextInput
        placeholder="Specialty"
        style={styles.input}
        value={formData.specialty}
        onChangeText={(value) => handleChange("specialty", value)}
      />
      <TextInput
        placeholder="Years of Experience"
        keyboardType="numeric"
        style={styles.input}
        value={formData.years_of_experience}
        onChangeText={(value) => handleChange("years_of_experience", value)}
      />
      <TextInput
        placeholder="Certification"
        style={styles.input}
        value={formData.certification}
        onChangeText={(value) => handleChange("certification", value)}
      />
    </>
  );

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={1000}
      style={[styles.container, { backgroundColor: theme.colors.warmBeige }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.charcoalGray }]}>
          Create an Account
        </Text>

        {/* User Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor:
                  userType === "customer"
                    ? theme.colors.rusticOrange
                    : theme.colors.softGray,
              },
            ]}
            onPress={() => setUserType("customer")}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    userType === "customer"
                      ? theme.colors.creamyWhite
                      : theme.colors.charcoalGray,
                },
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor:
                  userType === "chef"
                    ? theme.colors.rusticOrange
                    : theme.colors.softGray,
              },
            ]}
            onPress={() => setUserType("chef")}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    userType === "chef"
                      ? theme.colors.creamyWhite
                      : theme.colors.charcoalGray,
                },
              ]}
            >
              Chef
            </Text>
          </TouchableOpacity>
        </View>

        {/* Common Fields */}
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
        />

        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={formData.full_name}
          onChangeText={(value) => handleChange("full_name", value)}
        />

        {/* Conditional Fields */}
        {userType === "customer" ? renderCustomerFields() : renderChefFields()}

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
          onPress={handleSignup}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.creamyWhite} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.colors.creamyWhite }]}>
              Sign Up as {userType === "chef" ? "Chef" : "Customer"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={[styles.link, { color: theme.colors.rusticOrange }]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 25, textAlign: "center" },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  toggleText: {
    fontWeight: "bold",
    fontSize: 16,
  },

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
