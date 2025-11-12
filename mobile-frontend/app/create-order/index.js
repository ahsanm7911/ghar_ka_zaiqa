import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import theme from "../../utils/theme";
import api from "../../utils/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { showErrorToast, showSuccessToast, showInfoToast } from "../../utils/toast";

export default function CreateOrder() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        description: "",
        max_budget: "",
        delivery_address: "",
        preferred_delivery_time: "",
    });
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const handleChange = (name, value) => setForm({ ...form, [name]: value });

    // Handle date and time selection logic (safe for Android)
    const handleDateChange = (event, date) => {
        if (event.type === "dismissed" || !date) {
            setShowDatePicker(false);
            return;
        }
        setShowDatePicker(false);
        setSelectedDate(date);

        // After selecting date, show time picker
        setTimeout(() => setShowTimePicker(true), 200);
    };

    const handleTimeChange = (event, time) => {
        if (event.type === "dismissed" || !time) {
            setShowTimePicker(false);
            return;
        }

        setShowTimePicker(false);

        // Combine selected date + selected time
        const finalDateTime = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            time.getHours(),
            time.getMinutes()
        );

        // ✅ Validation: at least 2 hours in future
        const now = new Date();
        const minAllowedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours
        if (finalDateTime < minAllowedTime) {
            showErrorToast("Please select a time atleast 2 hours from now.")
            return;
        }

        setSelectedDate(finalDateTime);
        const formatted = finalDateTime.toISOString();
        setForm({ ...form, preferred_delivery_time: formatted });
    };

    const handleSubmit = async () => {
        if (!form.title || !form.description || !form.max_budget || !form.delivery_address || !form.preferred_delivery_time) {
            showErrorToast("All fields are required.");
            return;
        }

        try {
            setLoading(true);
            await api.post("api/orders/create/", form);
            showSuccessToast("Order created successfully.");
            router.replace("/customer-dashboard");
        } catch (error) {
            console.error(error.response?.data || error.message);
            showErrorToast("Failed to create order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.colors.primary,
                    padding: 12,
                }}
            >
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.lightText} />
                </TouchableOpacity>
                <Text style={{ color: theme.colors.lightText, fontSize: 20, fontWeight: "bold" }}>
                    Create Order
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {["title", "description", "max_budget", "delivery_address"].map((field) => (
                    <View key={field} style={{ marginBottom: 16 }}>
                        <Text style={{ color: theme.colors.text, marginBottom: 6, fontWeight: "500" }}>
                            {field.replace("_", " ").toUpperCase()}
                        </Text>
                        <TextInput
                            multiline={field === "description" || field === "delivery_address"}
                            numberOfLines={field === "description" || field === "delivery_address" ? 5 : 1}
                            placeholder={`Enter ${field.replace("_", " ")}`}
                            value={form[field]}
                            onChangeText={(text) => handleChange(field, text)}
                            style={{
                                borderWidth: 1,
                                borderColor: theme.colors.softGray,
                                borderRadius: 8,
                                padding: 10,
                                backgroundColor: theme.colors.card,
                                textAlignVertical: field === "description" || field === "delivery_address" ? "top" : "center",
                                height: field === "description" || field === "delivery_address" ? 120 : 45,
                            }}
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                    </View>
                ))}

                {/* ✅ Date + Time Picker */}
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.colors.text, marginBottom: 6, fontWeight: "500" }}>
                        PREFERRED DELIVERY TIME
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={{
                            borderWidth: 1,
                            borderColor: theme.colors.softGray,
                            borderRadius: 8,
                            padding: 10,
                            backgroundColor: theme.colors.card,
                        }}
                    >
                        <Text style={{ color: selectedDate ? theme.colors.text : theme.colors.textSecondary }}>
                            {selectedDate
                                ? new Date(selectedDate).toLocaleString()
                                : "Select date and time"}
                        </Text>
                    </TouchableOpacity>

                    {/* Separate pickers for stability */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={selectedDate || new Date()}
                            mode="time"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={handleTimeChange}
                        />
                    )}
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={{
                        backgroundColor: theme.colors.primary,
                        paddingVertical: 14,
                        borderRadius: 10,
                        alignItems: "center",
                        marginTop: 10,
                    }}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.lightText} />
                    ) : (
                        <Text style={{ color: theme.colors.lightText, fontWeight: "bold", fontSize: 16 }}>
                            Create Order
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
