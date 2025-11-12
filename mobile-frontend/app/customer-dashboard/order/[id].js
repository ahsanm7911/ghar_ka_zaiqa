import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import theme from "../../../utils/theme";
import api from "../../../utils/api";
import Animated, { FadeInDown } from "react-native-reanimated";
import { showErrorToast, showSuccessToast, showInfoToast } from "../../../utils/toast";
import { getAuthData } from "../../../utils/auth";

export default function OrderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [bids, setBids] = useState(null);
  const [loadingBidId, setLoadingBidId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    try {
      const { token } = await getAuthData();
      const authInfo = {
        headers: { 'Authorization': `Bearer ${token}` }
      }
      const [orderRes, bidsRes] = await Promise.all([
        api.get(`api/orders/${id}/`, authInfo),
        api.get(`api/orders/${id}/bids/`, authInfo),
      ])
      setOrder(orderRes.data);
      console.log("Order value: ", order);
      setBids(bidsRes.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      showErrorToast("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      setLoadingBidId(bidId);
      const { token } = await getAuthData();
      const response = await api.post(
        `api/bids/${bidId}/accept/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );

      console.log("Bid Accepted: ", response.data);
      showSuccessToast("Bid accepted successfully!");

      // Update order status and bids in UI
      const updatedBids = bids.map((b) =>
        b.id === bidId ? { ...b, status: "accepted" } : { ...b, status: "declined" }
      );
      setBids(updatedBids);

      // Optionally refresh the order data or navigate
      // e.g., router.replace("/customer-dashboard/in-progress")
    } catch (error) {
      console.error("Error accepting bid:", error.response?.data || error.message);
      const msg =
        error.response?.data?.detail ||
        "Failed to accept bid. Please try again later.";
      showErrorToast(msg);
    } finally {
      setLoadingBidId(null);
    }
  };

  // Mark order as complete 
  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      const response = await api.post(`api/orders/${order.id}/complete/`);

      console.log("Order completed: ", response.data);
      setOrderStatus("completed");
      showSuccessToast("Order marked as complete!");
      setReviewModalVisible(true); // open rating modal 
    } catch (error) {
      console.error("Error marking complete: ", error.response?.data || error.message);
      showErrorToast(error.response?.data.detail || "Unable to mark order as complete");
    } finally {
      setLoading(false);
    }
  }

  // Submit review 
  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      await api.post(`api/orders/${order.id}/review/`, {
        rating, comment
      });
      showSuccessToast("Thank you for your feedback!");
      setReviewModalVisible(false);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Review error: ", error.response?.data || error.message);
      showErrorToast("Failed to submite review");
    } finally {
      setSubmittingReview(false);
    }
  }

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.colors.text }}>Order not found.</Text>
      </SafeAreaView>
    );
  }

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

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.colors.text }}>
            {order.title}
          </Text>
          <Text style={{ marginTop: 8, color: theme.colors.textSecondary }}>
            {order.description}
          </Text>

          <View style={{ marginTop: 16 }}>
            <Text style={{ color: theme.colors.text }}>
              <Text style={{ fontWeight: "bold" }}>Budget:</Text> Rs. {order.max_budget}
            </Text>
            <Text style={{ color: theme.colors.text }}>
              <Text style={{ fontWeight: "bold" }}>Delivery Address:</Text> {order.delivery_address}
            </Text>
            <Text style={{ color: theme.colors.text }}>
              <Text style={{ fontWeight: "bold" }}>Preferred Delivery:</Text>{" "}
              {new Date(order.preferred_delivery_time).toLocaleString()}
            </Text>
            <Text style={{ color: theme.colors.text}}>Status: 
              <Text style={{ fontWeight: "bold", color: theme.colors.oliveGreen}}>
                 {order.status.toLowerCase().split(' ').map(word => " " + word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Text>
            </Text>
          </View>


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
                            Your Feedback
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


          {/* Bids Section */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: theme.colors.text }}>
              Bids Received ({order.total_bids || 0})
            </Text>
            {bids ? (
              bids.map((bid, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: theme.colors.card,
                    padding: 12,
                    borderRadius: 10,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: theme.colors.text }}>
                    <Text style={{ fontWeight: "bold" }}>Chef:</Text> {bid.chef_name}
                  </Text>
                  <Text style={{ color: theme.colors.text }}>
                    <Text style={{ fontWeight: "bold" }}>Rating:</Text> ⭐ {bid.chef_rating} ({bid.chef_order_count})
                  </Text>
                  <Text style={{ color: theme.colors.text }}>
                    <Text style={{ fontWeight: "bold" }}>Price:</Text> Rs. {bid.proposed_price}
                  </Text>
                  <Text style={{ color: theme.colors.text }}>
                    <Text style={{ fontWeight: "bold" }}>Delivery:</Text> within {bid.delivery_estimate.slice(-2)} hrs
                  </Text>

                  {bid.status === "pending" && (
                    <TouchableOpacity
                      onPress={() => handleAcceptBid(bid.id)}
                      disabled={loadingBidId === bid.id}
                      style={{
                        backgroundColor: theme.colors.primary,
                        paddingVertical: 10,
                        borderRadius: 8,
                        marginTop: 10,
                      }}
                    >
                      {loadingBidId === bid.id ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text
                          style={{
                            color: "#fff",
                            textAlign: "center",
                            fontWeight: "600",
                          }}
                        >
                          Accept Bid
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {bid.status === "accepted" && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.colors.secondary,
                        paddingVertical: 10,
                        borderRadius: 8,
                        marginTop: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          textAlign: "center",
                          fontWeight: "600",
                        }}
                      >
                        Bid Accepted
                      </Text>
                    </TouchableOpacity>
                  )}

                  {bid.status === "declined" && (
                    <Text
                      style={{
                        backgroundColor: theme.colors.error,
                        color: theme.colors.creamyWhite,
                        textAlign: "center",
                        marginTop: 10,
                        padding: 10,
                        borderRadius: 10
                      }}
                    >
                      Declined
                    </Text>
                  )}

                </View>
              ))
            ) : (
              <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
                No bids yet.
              </Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
