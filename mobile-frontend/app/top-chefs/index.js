import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../utils/api";
import theme from "../../utils/theme";
import { useRouter } from "expo-router";
import { showErrorToast } from "../../utils/toast";

export default function TopChefsScreen() {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchChefs = async () => {
    try {
      const response = await api.get("api/chefs/top/");
      setChefs(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      showErrorToast("Failed to load chefs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  const renderChef = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 14,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
      onPress={() => router.push(`/top-chefs/${item.id}`)}
    >
      <Image
        source={{ uri: item.profile_picture || "https://cdn-icons-png.flaticon.com/512/2922/2922510.png" }}
        style={{ width: 60, height: 60, borderRadius: 30, marginRight: 15 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>{item.name}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{item.specialty || "General Cuisine"}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <Ionicons name="star" size={16} color={theme.colors.goldenYellow} />
          <Text style={{ marginLeft: 4, color: theme.colors.text }}>{item.rating} ({item.total_reviews})</Text>
          <Text style={{ marginLeft: 12, color: theme.colors.oliveGreen, fontWeight: "500" }}>
            {item.success_rate}% success
          </Text>
        </View>
        <Text style={{ marginTop: 4, color: theme.colors.textSecondary, fontSize: 13 }}>
          Total bids: {item.total_bids}
        </Text>
        <Text style={{ marginTop: 4, color: theme.colors.textSecondary, fontSize: 13 }}>
          Completed Orders: {item.completed_orders}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.lightText} />
        </TouchableOpacity>
        <Text style={{ color: theme.colors.lightText, fontSize: 20, fontWeight: "bold" }}>
          Top Chefs
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : chefs.length > 0 ? (
        <FlatList
          data={chefs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChef}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: theme.colors.secondary }}>No chefs found.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
