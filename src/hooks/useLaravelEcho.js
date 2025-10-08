import { useEffect, useState, useCallback, useRef } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const useLaravelEcho = (groupId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const echoRef = useRef(null);
  const currentGroupRef = useRef(null);
  const isInitializedRef = useRef(false);

  // ✅ Initialize Echo once (survives React Strict Mode)
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitializedRef.current) return;
    
    console.log("🚀 Initializing Echo...");
    isInitializedRef.current = true;

    // Enable Pusher logging in development
    if (import.meta.env.DEV) {
      window.Pusher.logToConsole = true;
    }

    echoRef.current = new Echo({
      broadcaster: "pusher",
      key: "ediify-key",
      cluster: "mt1",
      wsHost: "ediifyapi.tife.com.ng",
      wsPort: 6001,
      wssPort: 6001,
      forceTLS: false,
      enableStats: false,
      enabledTransports: ["ws", "wss"],
      encrypted: false,
    });

    // Connection state listeners
    echoRef.current.connector.pusher.connection.bind("connected", () => {
      console.log("✅ Pusher connected - Socket ID:", echoRef.current.socketId());
      setIsConnected(true);
    });
    
    echoRef.current.connector.pusher.connection.bind("disconnected", () => {
      console.log("⚠️ Pusher disconnected");
      setIsConnected(false);
    });
    
    echoRef.current.connector.pusher.connection.bind("error", (error) => {
      console.error("❌ Pusher connection error:", error);
      setIsConnected(false);
    });

    echoRef.current.connector.pusher.connection.bind("unavailable", () => {
      console.warn("⚠️ Pusher unavailable");
      setIsConnected(false);
    });

    echoRef.current.connector.pusher.connection.bind("failed", () => {
      console.error("❌ Pusher connection failed");
      setIsConnected(false);
    });

    return () => {
      console.log("🔄 Component unmounting, leaving channels");
      if (currentGroupRef.current && echoRef.current) {
        echoRef.current.leave(`group.${currentGroupRef.current}`);
      }
    };
  }, []);

  // ✅ Handle group channel subscription
  useEffect(() => {
    if (!groupId || !echoRef.current) {
      console.log("⏸️ No groupId or Echo not ready, skipping subscription");
      return;
    }

    console.log(`🔄 Switching to group ${groupId}`);

    // Leave previous channel if switching groups
    if (currentGroupRef.current && currentGroupRef.current !== groupId) {
      console.log(`👋 Leaving group.${currentGroupRef.current}`);
      echoRef.current.leave(`group.${currentGroupRef.current}`);
    }

    currentGroupRef.current = groupId;

    // Subscribe to the channel
    const channel = echoRef.current.channel(`group.${groupId}`);

    console.log(`🎯 Subscribed to channel: group.${groupId}`);
    console.log(`🎧 Listening for event: "message.sent"`);

    // ✅ DEBUG: Listen to ALL events on this channel
    const pusherChannel = echoRef.current.connector.pusher.channel(`group.${groupId}`);
    pusherChannel.bind_global((eventName, data) => {
      console.log(`🔔 ANY EVENT on group.${groupId}:`, eventName, data);
    });
    // Try both with and without the dot prefix
    channel.listen("message.sent", (data) => {
      console.log("📨 [message.sent] Raw event received:", data);
      processMessage(data);
    });

    channel.listen(".message.sent", (data) => {
      console.log("📨 [.message.sent] Raw event received:", data);
      processMessage(data);
    });

    // Helper function to process incoming messages
    function processMessage(event) {
      console.log("🔍 Processing message, type:", typeof event, "data:", event);

      let messageData = event;

      // If data is a string, parse it
      if (typeof event === 'string') {
        try {
          messageData = JSON.parse(event);
          console.log("📦 Parsed string to object:", messageData);
        } catch (e) {
          console.error("❌ Failed to parse message data:", e);
          return;
        }
      }

      // Extract message from the parsed data
      const msg = messageData.message || messageData;

      if (!msg || !msg.id) {
        console.warn("⚠️ Invalid message structure:", msg);
        return;
      }

      const formattedMessage = {
        id: msg.id,
        group_id: msg.group_id,
        user_id: msg.user_id,
        message: msg.message,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        user: msg.user,
      };

      console.log("✅ Formatted message:", formattedMessage);

      // Add message to state (prevent duplicates)
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === formattedMessage.id);
        if (exists) {
          console.log("⚠️ Duplicate message prevented:", formattedMessage.id);
          return prev;
        }
        console.log("✅ Adding new message to state, total:", prev.length + 1);
        return [...prev, formattedMessage];
      });
    }

    channel
      .subscribed(() => {
        console.log(`✅ Successfully subscribed to group.${groupId}`);
        console.log(`📡 Ready to receive events on this channel`);
        console.log(`⚠️ IMPORTANT: Make sure backend broadcasts to channel "group.${groupId}" with event "message.sent"`);
      })
      .error((error) => {
        console.error("❌ Channel subscription error:", error);
      });

    return () => {
      if (echoRef.current && groupId) {
        console.log(`👋 Leaving group.${groupId} on groupId change`);
        echoRef.current.leave(`group.${groupId}`);
      }
    };
  }, [groupId]);

  // ✅ Method to manually set messages (for initial load from API)
  const initializeMessages = useCallback((initialMessages) => {
    console.log(`📥 Initializing ${initialMessages.length} messages`);
    setMessages(initialMessages);
    setIsLoadingMessages(false);
  }, []);

  // ✅ Method to clear messages when switching chats
  const clearMessages = useCallback(() => {
    console.log("🗑️ Clearing messages");
    setMessages([]);
    setIsLoadingMessages(true);
  }, []);

  return {
    messages,
    isConnected,
    isLoadingMessages,
    initializeMessages,
    clearMessages,
  };
};