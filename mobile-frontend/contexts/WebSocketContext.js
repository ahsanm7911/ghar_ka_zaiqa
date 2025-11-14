import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Platform  } from "react-native";
import { getAuthData } from "../utils/auth";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectInterval = useRef(null);

  const BASE_URL = Platform.OS === 'web' ? "ws://localhost:8000/" : "ws://10.0.2.2:8000/"
  const SERVER_URL = `${BASE_URL}ws/orders/`; // change if using physical device

  const connectWebSocket = async () => {
    const { token } = await getAuthData();
    if (!token) return; 
    console.log("🔌 Attempting to connect WebSocket...");
    const socket = new WebSocket(SERVER_URL + `?token=${token}`);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      wsRef.current = socket;
      setConnected(true);

      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
        reconnectInterval.current = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    socket.onerror = (e) => {
      console.error("❌ WebSocket error:", e.message);
    };

    socket.onclose = (e) => {
      console.warn("⚠️ WebSocket closed, will attempt to reconnect...");
      setConnected(false);

      // retry every 3 seconds
      if (!reconnectInterval.current) {
        if(!token) return;
        reconnectInterval.current = setInterval(() => {
          console.log("🔁 Reconnecting WebSocket...");
          connectWebSocket();
        }, 3000);
      }
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectInterval.current) clearInterval(reconnectInterval.current);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, messages, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
