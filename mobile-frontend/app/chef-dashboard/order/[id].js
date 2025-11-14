import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../utils/api";
import { getAuthData } from "../../../utils/auth";
import theme from "../../../utils/theme";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";

export default function OrderDetails() {
    const { id } = useLocalSearchParams(); // get order id from route
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bid, setBid] = useState(null);
    const [price, setPrice] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const { token } = await getAuthData();
            const response = await api.get(`api/orders/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setOrder(response.data);

            // check if chef has already bid on this order
            const bidsResponse = await api.get("api/bids/my-bids/", {
                headers: { Authorization: `Token ${token}` },
            });
            const existingBid = bidsResponse.data.find((b) => b.order === parseInt(id));
            if (existingBid) setBid(existingBid);
        } catch (error) {
            console.error("Error fetching order details:", error.response?.data || error);
            showErrorToast("Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!price) {
            showErrorToast("Please enter your bid price");
            return;
        }
        try {
            const { token } = await getAuthData();
            const response = await api.post(
                `api/orders/${id}/bid/`,
                {
                    order_id: id,
                    proposed_price: price,
                    delivery_estimate: deliveryTime,
                    message: message
                },
                { headers: { Authorization: `Token ${token}` } }
            );
            setBid(response.data);
            showSuccessToast("Bid placed successfully!")
        } catch (error) {
            console.error("Bid error:", error.response?.data);
            let errorMessage = "Something went wrong.";
            const data = error.response?.data;
            if (data) {
                if (typeof data === "string") errorMessage = data;
                else if (Array.isArray(data.non_field_errors))
                    errorMessage = data.non_field_errors.join("\n");
                else
                    errorMessage = Object.entries(data)
                        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
                        .join("\n");
            }
            showErrorToast(errorMessage);
        }
    };

    if (loading)
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.colors.rusticOrange} />
            </View>
        );

    if (!order)
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>No order details available</Text>
            </View>
        );

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
                    Order Details
                </Text>
            </View>

            <ScrollView style={{ flex: 1, backgroundColor: theme.colors.warmBeige, padding: 16 }}>


                <Text style={{ fontSize: 22, fontWeight: "700", color: theme.colors.charcoalGray }}>
                    {order.title}
                </Text>

                <Text style={{ color: theme.colors.charcoalGray, marginVertical: 8 }}>
                    Customer: {order.customer_name}
                </Text>

                <Text style={{ color: theme.colors.charcoalGray, marginVertical: 8 }}>
                    {order.description}
                </Text>
                <Text style={{ color: theme.colors.oliveGreen }}>Budget: Rs. {order.max_budget}</Text>
                <Text style={{ color: theme.colors.oliveGreen }}>
                    Delivery: {new Date(order.preferred_delivery_time).toLocaleString()}
                </Text>
                <Text style={{ color: theme.colors.charcoalGray, marginTop: 5 }}>
                    Address: {order.delivery_address}
                </Text>

                {/* Bid section */}
                {bid ? (
                    <View
                        style={{
                            marginTop: 20,
                            padding: 15,
                            borderRadius: 10,
                            backgroundColor: theme.colors.creamyWhite,
                        }}
                    >
                        <Text style={{ fontWeight: "600", color: theme.colors.charcoalGray, marginBottom: 5 }}>
                            Your Bid
                        </Text>
                        <Text>💰 Rs. {bid.proposed_price}</Text>
                        <Text>📝 {bid.message || "No message"}</Text>
                        <Text>Status:  {bid.status}</Text>

                        <TouchableOpacity
                            onPress={() => router.push(`/chat/${order.id}`)}
                            style={{
                                backgroundColor: theme.colors.rusticOrange,
                                paddingVertical: 10,
                                borderRadius: 8,
                                marginTop: 12,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: theme.colors.creamyWhite, fontWeight: "600" }}>Open Chat</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View
                        style={{
                            marginTop: 20,
                            padding: 15,
                            borderRadius: 10,
                            backgroundColor: theme.colors.creamyWhite,
                        }}
                    >
                        <Text style={{ fontWeight: "600", color: theme.colors.charcoalGray, marginBottom: 10 }}>
                            Place Your Bid
                        </Text>
                        <TextInput
                            placeholder="Enter your bid amount"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                            style={{
                                backgroundColor: theme.colors.softGray,
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 10,
                            }}
                        />

                        <TextInput
                            placeholder="Estimated delivery time (in hours)"
                            value={deliveryTime}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, "");
                                setDeliveryTime(cleaned);
                            }}
                            keyboardType="numer-pad"
                            style={{
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 16,
                            }}
                        />

                        <TextInput
                            placeholder="Optional message for the customer"
                            multiline
                            value={message}
                            onChangeText={setMessage}
                            style={{
                                backgroundColor: theme.colors.softGray,
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 10,
                                minHeight: 60,
                            }}
                        />

                        <TouchableOpacity
                            onPress={handlePlaceBid}
                            style={{
                                backgroundColor: theme.colors.rusticOrange,
                                paddingVertical: 10,
                                borderRadius: 8,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: theme.colors.creamyWhite, fontWeight: "600" }}>Submit Bid</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {order?.review && (
                    <View
                        style={{
                            backgroundColor: theme.colors.card,
                            borderRadius: 12,
                            padding: 16,
                            marginTop: 20,
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>
                            Customer Review
                        </Text>

                        <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
                            Rating: ⭐ {order.review.rating} / 5
                        </Text>

                        {order.review.comment ? (
                            <Text style={{ color: theme.colors.text, marginTop: 6 }}>
                                "{order.review.comment}"
                            </Text>
                        ) : (
                            <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>
                                No written feedback provided.
                            </Text>
                        )}

                        <Text style={{ color: theme.colors.textSecondary, marginTop: 8, fontSize: 12 }}>
                            Reviewed on {new Date(order.review.created_at).toLocaleString()}
                        </Text>
                    </View>
                )}


                {/* Chat Placeholder */}
                <View
                    style={{
                        marginTop: 25,
                        backgroundColor: theme.colors.softGray,
                        padding: 15,
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ fontWeight: "600", color: theme.colors.charcoalGray }}>Chat</Text>
                    <Text style={{ color: theme.colors.charcoalGray, marginTop: 5 }}>
                        💬 Chat with the customer will appear here once connected.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
