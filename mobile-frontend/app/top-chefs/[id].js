import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../utils/api";
import theme from "../../utils/theme";
import { showErrorToast } from "../../utils/toast";

export default function ChefProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChefProfile = async () => {
    try {
      const response = await api.get(`api/chefs/${id}/`);
      setChef(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      showErrorToast("Failed to load chef profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefProfile();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!chef) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.colors.secondary }}>Chef not found.</Text>
      </SafeAreaView>
    );
  }

  const renderReview = ({ item }) => (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 10,
        padding: 14,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Ionicons name="person-circle-outline" size={22} color={theme.colors.textSecondary} />
        <Text style={{ fontWeight: "600", color: theme.colors.text, marginLeft: 6 }}>
          {item.customer}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < item.rating ? "star" : "star-outline"}
            size={16}
            color={theme.colors.goldenYellow}
          />
        ))}
      </View>
      {item.comment ? (
        <Text style={{ color: theme.colors.textSecondary }}>{item.comment}</Text>
      ) : (
        <Text style={{ color: theme.colors.border, fontStyle: "italic" }}>No comment provided.</Text>
      )}
      <Text
        style={{
          color: theme.colors.border,
          fontSize: 12,
          textAlign: "right",
          marginTop: 6,
        }}
      >
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.lightText} />
        </TouchableOpacity>
        <Text style={{ color: theme.colors.lightText, fontSize: 20, fontWeight: "bold" }}>
          Chef Profile
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Info */}
      <View style={{ alignItems: "center", paddingVertical: 20 }}>
        <Ionicons name="restaurant-outline" size={80} color={theme.colors.primary} />
        <Text style={{ fontSize: 22, fontWeight: "700", color: theme.colors.text }}>{chef.name}</Text>
        <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>
          {chef.specialty || "General Cuisine"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Ionicons name="star" size={18} color={theme.colors.goldenYellow} />
          <Text style={{ marginLeft: 4, fontWeight: "600", color: theme.colors.text }}>
            {chef.rating} ({chef.reviews.length} reviews)
          </Text>
        </View>
        <Text style={{ color: theme.colors.textSecondary }}>
          Completed Orders: {chef.completed_orders}
        </Text>
        <Text
          style={{
            color: theme.colors.text,
            marginHorizontal: 20,
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {chef.bio || "No bio available."}
        </Text>
      </View>

      {/* Reviews */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: theme.colors.text,
          marginLeft: 20,
          marginTop: 10,
        }}
      >
        Reviews
      </Text>
      {chef.reviews.length > 0 ? (
        <FlatList
          data={chef.reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: theme.colors.secondary, marginTop: 20 }}>
            This chef has no reviews yet.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
