import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../utils/api";
import { getAuthData } from "../../utils/auth";
import theme from "../../utils/theme";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toast";

const ChatDetailScreen = () => {
  const { id } = useLocalSearchParams(); // chat room ID
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState(null);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    fadeIn();
    fetchMessages();
    setupWebSocket();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fetchMessages = async () => {
    try {
      const { token } = await getAuthData();
      const response = await api.get(`api/chat/${id}/messages/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages: ", error);
      showErrorToast("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = async () => {
    const { token } = await getAuthData();
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${id}/?token=${token}`);

    socket.onopen = () => console.log("WebSocket Connected ✅");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        setMessages((prev) => [...prev, data]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    };
    socket.onerror = (err) => console.error("WebSocket Error: ", err.message);
    socket.onclose = () => console.log("WebSocket Disconnected ❌");

    setWs(socket);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !ws) return;
    ws.send(JSON.stringify({ message: newMessage }));
    setNewMessage("");
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.is_user_message ? styles.userMessage : styles.otherMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.is_user_message ? styles.userText : styles.otherText,
        ]}
      >
        {item.message}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.rusticOrange} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.softGray}
            style={styles.input}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.warmBeige },
  innerContainer: { flex: 1, padding: 10 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.softGray,
    marginBottom: 10,
  },
  backButton: { fontSize: 16, color: theme.colors.rusticOrange, marginRight: 10 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.charcoalGray,
  },
  messageContainer: {
    maxWidth: "75%",
    marginVertical: 4,
    borderRadius: 12,
    padding: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.rusticOrange,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.creamyWhite,
    borderWidth: 1,
    borderColor: theme.colors.softGray,
  },
  messageText: { fontSize: 15 },
  userText: { color: theme.colors.creamyWhite },
  otherText: { color: theme.colors.charcoalGray },
  timestamp: {
    fontSize: 10,
    color: theme.colors.softGray,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.creamyWhite,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  input: { flex: 1, fontSize: 15, color: theme.colors.charcoalGray },
  sendButton: {
    backgroundColor: theme.colors.rusticOrange,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButtonText: { color: theme.colors.creamyWhite, fontWeight: "bold" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.warmBeige,
  },
});

export default ChatDetailScreen;
