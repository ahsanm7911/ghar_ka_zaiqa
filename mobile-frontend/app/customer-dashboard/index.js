import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import theme from "../../utils/theme";
import api from "../../utils/api";
import { clearAuthData } from "../../utils/auth";
import { showErrorToast, showSuccessToast, showInfoToast } from "../../utils/toast";

export default function CustomerDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("open");
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { key: "open", label: "Open Orders" },
    { key: "accepted", label: "In Progress" },
    { key: "completed", label: "Completed" },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("api/orders/my/");
      setOrders(response.data || []);
    } catch (error) {
      console.error(error.response?.data || error.message);
      showErrorToast("Error loading orders, please try again later.")
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await clearAuthData();
    showSuccessToast("Logged out successfully.");
    router.replace("/login");
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => order.status === selectedFilter);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/customer-dashboard/${item.id}`)}
      style={{
        backgroundColor: theme.colors.card,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: theme.colors.text }}>
          {item.title}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          Budget: Rs. {item.max_budget}
        </Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          Status: {item.status.replace("_", " ")}
        </Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          Bids: {item.total_bids || 0}
        </Text>
        {item.status === 'accepted' && (

          <TouchableOpacity
          onPress={() => showInfoToast("This funcionality hasn't been implemented yet.")}
          style={{
            backgroundColor: theme.colors.primary,
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
              Mark as Complete
            </Text>
        </TouchableOpacity>
        )}
      </Animated.View>
    </TouchableOpacity>
  );

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
          Customer Dashboard
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

      {/* Filters */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 12,
          backgroundColor: theme.colors.card,
        }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor:
                selectedFilter === filter.key ? theme.colors.primary : theme.colors.softGray,
            }}
          >
            <Text
              style={{
                color:
                  selectedFilter === filter.key ? theme.colors.lightText : theme.colors.text,
                fontWeight: "500",
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders Section */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
            No {selectedFilter} orders found.
          </Text>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/create-order")}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: theme.colors.primary,
          padding: 16,
          borderRadius: 50,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 3 },
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color={theme.colors.lightText} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
