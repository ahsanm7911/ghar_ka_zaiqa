import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getAuthData } from "../../utils/auth";
import api from "../../utils/api";
import theme from "../../utils/theme";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toast";

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { token } = await getAuthData();
        const response = await api.get("api/chat/", {
          headers: { Authorization: `Token ${token}` },
        });
        setChats(response.data);
      } catch (error) {
        console.error("Error fetching chats: ", error);
        showErrorToast("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <Text style={styles.chatTitle}>
        {item.sender_name || "Chat"}
      </Text>
      <Text style={styles.chatSubtitle} numberOfLines={1}>
        {item.message || "No messages yet"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.rusticOrange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderChat}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No active chats yet</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.warmBeige,
    padding: 16,
  },
  chatItem: {
    backgroundColor: theme.colors.creamyWhite,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderColor: theme.colors.softGray,
    borderWidth: 1,
  },
  chatTitle: {
    color: theme.colors.charcoalGray,
    fontSize: 16,
    fontWeight: "bold",
  },
  chatSubtitle: {
    color: theme.colors.charcoalGray,
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.charcoalGray,
    marginTop: 50,
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.warmBeige,
  },
});

export default ChatListScreen;
