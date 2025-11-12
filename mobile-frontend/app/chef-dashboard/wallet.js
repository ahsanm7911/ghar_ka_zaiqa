import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import theme from '../../utils/theme';
import { showErrorToast } from '../../utils/toast';

export default function WalletScreen() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchWalletData = async () => {
        try {
            const response = await api.get("api/wallet/");
            setWallet(response.data);
        } catch (error) {
            console.error(error.response?.data || error.message);
            showErrorToast("Unable to load wallet details.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWalletData();
    };

    const renderTransaction = ({ item }) => (
        <View
            style={{
                backgroundColor: theme.colors.card,
                marginHorizontal: 16,
                marginVertical: 6,
                borderRadius: 10,
                padding: 12,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
            }}
        >
            <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text }}>
                {item.transaction_type.toUpperCase()}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, marginVertical: 4 }}>
                Rs {item.amount} — {new Date(item.created_at).toLocaleString()}
            </Text>
            {item.description ? (
                <Text style={{ color: theme.colors.textSecondary }}>{item.description}</Text>
            ) : null}
        </View>
    );

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
                    Wallet
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Wallet Balance */}
            <View
                style={{
                    backgroundColor: theme.colors.card,
                    margin: 16,
                    borderRadius: 12,
                    padding: 20,
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                }}
            >
                <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>Available Balance</Text>
                <Text style={{ fontSize: 32, fontWeight: "bold", color: theme.colors.primary }}>
                    Rs {wallet?.balance || "0.00"}
                </Text>
            </View>

            {/* Transactions */}
            <Text style={{ marginLeft: 20, fontSize: 18, fontWeight: "600", color: theme.colors.text }}>
                Recent Transactions
            </Text>

            <FlatList
                data={wallet?.transactions || []}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={{ alignItems: "center", marginTop: 30 }}>
                        <Text style={{ color: theme.colors.textSecondary }}>No transactions yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}