import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { showErrorToast, showSuccessToast, showInfoToast } from "../../utils/toast";
import { Ionicons } from "@expo/vector-icons";
import api from "../../utils/api";
import theme from "../../utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PlaceBidModal from "./PlaceBidModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuthData } from "../../utils/auth";

const FILTERS = ['Open Orders', 'Bid Placed', 'Closed Orders'];
export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Open Orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bids, setBids] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await api.get("api/orders/open/", {
        headers: { Authorization: `Token ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Order fetch error: ", error);
      showErrorToast("Failed to load orders!")
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const { token } = await getAuthData();
      const response = await api.get('api/bids/my-bids/', {
        headers: { Authorization: `Token ${token}`},
      }); 
      setBids(response.data);
    } catch (error) {
      console.error("Bid fetch error: ", error);
    }
  }

  useEffect(() => {
    fetchOrders();
    fetchBids();
  }, []);

  const hasPlacedBid = (orderId) => {
    return bids.some((bid) => bid.order === orderId);
  }
  const handlePlaceBid = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'Open Orders') return !hasPlacedBid(order.id) && order.status === 'open';
    if (activeFilter === 'Bid Placed') return hasPlacedBid(order.id);
    if (activeFilter === 'Closed Orders') return order.status === 'closed';
    return true;
  })

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <Text style={{ color: theme.colors.lightText, fontSize: 22, fontWeight: "bold" }}>
          Chef Dashboard
        </Text>

        <TouchableOpacity onPress={handleLogout} style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.lightText} />
          <Text style={{ color: theme.colors.lightText, marginLeft: 6, fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/chat")}
          style={{
            backgroundColor: theme.colors.accent,
            padding: 8,
            borderRadius: 50,
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.lightText} />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 15, paddingVertical: 12}}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={{
            backgroundColor:
                activeFilter === filter ? theme.colors.rusticOrange : theme.colors.oliveGreen,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 25,
            }}
          >
            <Text style={{ color: theme.colors.creamyWhite, fontWeight: "600" }}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : filteredOrders.length === 0 ? (
        <Text style={{ textAlign: "center", color: theme.colors.charcoalGray, marginTop: 30}}>No orders found.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const bidPlaced = hasPlacedBid(item.id);
            return (
            <View
              style={{
                backgroundColor: theme.colors.card,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <TouchableOpacity
              onPress={() => router.push(`/chef-dashboard/order/${item.id}`)}
              style={{
                backgroundColor: theme.colors.creamyWhite,
                padding: 15, 
                borderRadius: 10, 
                marginBottom: 12, 
                shadowColor: "#000", 
                shadowOpacity: 0.1, 
                shadowRadius: 4,
              }}
              >
                  <Text style={{ fontSize: 18, fontWeight: "600", color: theme.colors.text }}>{item.title}</Text>
                  <Text style={{ color: theme.colors.text, marginTop: 4 }}>{item.description}</Text>
                  <Text style={{ marginTop: 6, color: theme.colors.text }}>
                    💰 Budget: Rs. {item.max_budget} | 🕓 {new Date(item.preferred_delivery_time).toLocaleTimeString()}
                  </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={bidPlaced}
                style={{
                  backgroundColor: bidPlaced ? theme.colors.softGray : theme.colors.rusticOrange,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 10,
                }}
                onPress={() => handlePlaceBid(item)}
              >
                <Text style={{ color: theme.colors.text, textAlign: "center", fontWeight: "600" }}>{bidPlaced ? "✔️ Bid Placed" : "Place Bid"}</Text>
              </TouchableOpacity>
            </View>
          )}}
          ListEmptyComponent={<Text style={{ color: theme.colors.text, textAlign: "center", marginTop: 50 }}>No new orders yet 🍳</Text>}
        />
      )}

      <PlaceBidModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
        refreshOrders={fetchOrders}
      />
    </SafeAreaView>
  );
}
