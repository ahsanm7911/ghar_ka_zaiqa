import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../utils/api";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toast";
import theme from "../../utils/theme";

export default function PlaceBidModal({ visible, onClose, order, refreshOrders }) {
  const [price, setPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("refreshOrders prop: ", refreshOrders);
  }, []);

  const handleBid = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await api.post(
        "api/orders/" + order.id + "/bid/",
        {
          order_id: order.id,
          proposed_price: price,
          delivery_estimate: deliveryTime,
          message: message, 
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      console.log("Response: ", response.data);
      showSuccessToast("Bid placed successfully!");

      if(refreshOrders) {
        await refreshOrders();
      }

      onClose();

      // Clear fields 
      setPrice('');
      setDeliveryTime('');
      setMessage('');

    } catch (error) {
      console.error('Bid error: ', error.response?.data);
      let errorMessage = 'Something went wrong';
      const data = error.response?.data;

      if (data) {
        if(typeof data === 'string') {
          errorMessage = data;
        } else if (Array.isArray(data.non_field_errors)) {
          errorMessage = data.non_field_errors.join('\n');
        } else {
          errorMessage = Object.entries(data)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        }
      }
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.card,
            width: "85%",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", color: theme.colors.text, marginBottom: 10 }}>
            Place a Bid for {order.title}
          </Text>

          <TextInput
            placeholder="Enter your bid amount"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
            }}
          />
            <TextInput
              placeholder="Estimated delivery time (in hours)"
              value={deliveryTime}
              onChangeText={setDeliveryTime}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
              }}
            />
          <TextInput
            placeholder="Optional message for Customer"
            value={message}
            onChangeText={setMessage}
            keyboardType="text"
            multiline
            numberOfLines={4}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 8,
              padding: 10,
              marginBottom: 16,
            }}
          />

          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
              onPress={handleBid}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Submit Bid</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: theme.colors.error, textAlign: "center" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
