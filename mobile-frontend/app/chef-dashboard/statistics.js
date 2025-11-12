import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../../utils/api";
import theme from "../../utils/theme";
import { showErrorToast } from "../../utils/toast";

export default function ChefStatisticsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const response = await api.get("api/chef/stats/");
      setStats(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      showErrorToast("Unable to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
          Statistics
        </Text>
        <TouchableOpacity onPress={() => router.push("/chef-dashboard/wallet")}>
          <Ionicons name="wallet-outline" size={24} color={theme.colors.lightText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Wallet Overview */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 14,
            padding: 20,
            alignItems: "center",
            marginBottom: 20,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>Wallet Balance</Text>
          <Text style={{ fontSize: 36, fontWeight: "bold", color: theme.colors.primary, marginTop: 5 }}>
            Rs. {stats.balance}
          </Text>
        </View>

        {/* Mini Cards Section */}
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text, marginBottom: 10 }}>
          Today’s Summary
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
          <StatCard title="Bids Placed" value={stats.today.bids} icon="document-text-outline" color={theme.colors.oliveGreen} />
          <StatCard title="Orders Completed" value={stats.today.completed_orders} icon="checkmark-done-circle-outline" color={theme.colors.rusticOrange} />
          <StatCard title="Earnings Today" value={`Rs ${stats.today.earnings}`} icon="cash-outline" color={theme.colors.goldenYellow} />
        </View>

        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text, marginVertical: 15 }}>
          Overall Performance
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
          <StatCard title="Total Bids" value={stats.overall.total_bids} icon="briefcase-outline" color={theme.colors.rusticOrange} />
          <StatCard title="Completed Orders" value={stats.overall.completed_orders} icon="trophy-outline" color={theme.colors.oliveGreen} />
          <StatCard title="Success Rate" value={`${stats.overall.success_rate}%`} icon="trending-up-outline" color={theme.colors.oliveGreen} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <View
      style={{
        width: "48%",
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <Ionicons name={icon} size={28} color={color} style={{ marginBottom: 8 }} />
      <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text }}>{title}</Text>
      <Text style={{ fontSize: 20, fontWeight: "700", color }}>{value}</Text>
    </View>
  );
}
