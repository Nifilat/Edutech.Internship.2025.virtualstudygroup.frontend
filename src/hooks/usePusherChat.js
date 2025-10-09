import { useEffect, useState, useCallback, useRef } from "react";
import Pusher from "pusher-js";

export const usePusherChat = (groupId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const currentGroupRef = useRef(null);

  // Initialize Pusher ONCE
  useEffect(() => {
    if (pusherRef.current) return;

    // Detect if we're on HTTPS (production) or HTTP (localhost)
    const isSecure = window.location.protocol === "https:";

    console.log(`🚀 Initializing Pusher... (Secure: ${isSecure})`);
    Pusher.logToConsole = false;

    pusherRef.current = new Pusher("ediify-key", {
      cluster: "mt1",
      wsHost: "ediifyapi.tife.com.ng", 
      wsPort: 443, 
      wssPort: 443,
      forceTLS: true, // ✅ always use TLS on live
      enabledTransports: ["wss"], 
      disableStats: true,
      encrypted: true,
    });

    pusherRef.current.connection.bind("connected", () => {
      const socketId = pusherRef.current.connection.socket_id;
      console.log("✅ Pusher connected! Socket ID:", socketId);
      setIsConnected(true);
    });

    pusherRef.current.connection.bind("disconnected", () => {
      console.log("⚠️ Pusher disconnected");
      setIsConnected(false);
    });

    return () => {
      if (pusherRef.current) {
        console.log("🧹 Disconnecting Pusher");
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, []);

  // Subscribe to channel
  useEffect(() => {
    if (!groupId || !pusherRef.current) {
      console.log("⏸️ No groupId or Pusher not ready");
      return;
    }

    // Already subscribed to this channel
    if (currentGroupRef.current === groupId && channelRef.current) {
      console.log(`✅ Already subscribed to group.${groupId}`);
      return;
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log(`📡 SUBSCRIBING TO CHANNEL: group.${groupId}`);
    console.log(`${"=".repeat(70)}\n`);

    // Unsubscribe from previous channel
    if (channelRef.current && currentGroupRef.current !== groupId) {
      const oldChannel = `group.${currentGroupRef.current}`;
      console.log(`👋 Unsubscribing from ${oldChannel}`);
      pusherRef.current.unsubscribe(oldChannel);
      channelRef.current = null;
    }

    currentGroupRef.current = groupId;
    const channelName = `group.${groupId}`;

    // Subscribe
    channelRef.current = pusherRef.current.subscribe(channelName);

    // Success
    channelRef.current.bind("pusher:subscription_succeeded", () => {
      console.log(`\n✅ SUBSCRIBED TO: ${channelName}`);
      console.log(`🎧 Listening for: message.sent\n`);
    });

    // Error
    channelRef.current.bind("pusher:subscription_error", (err) => {
      console.error(`❌ Subscription failed for ${channelName}:`, err);
    });

    // Listen for message.sent event
    channelRef.current.bind("message.sent", (eventData) => {
      try {
        // The data can come as object or string depending on Pusher version
        let parsedData = eventData;
        if (typeof eventData === "string") {
          console.log("📦 Parsing JSON string...");
          parsedData = JSON.parse(eventData);
          console.log("📦 Parsed data:", parsedData);
        }

        // Extract the message object
        const msg = parsedData.message;

        if (!msg || !msg.id) {
          console.error(
            "❌ Invalid message structure. Expected {message: {...}}, got:",
            parsedData
          );
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

        // Add to state
        setMessages((prev) => {
          // Check for duplicates
          const exists = prev.some((m) => m.id === formattedMessage.id);
          if (exists) {
            console.warn(
              "⚠️ Duplicate message detected, skipping:",
              formattedMessage.id
            );
            return prev;
          }

          const newMessages = [...prev, formattedMessage];

          return newMessages;
        });
      } catch (error) {
        console.error("❌ Error processing message:", error);
        console.error("❌ Error stack:", error.stack);
      }
    });

    // Cleanup
    return () => {
      if (channelRef.current && pusherRef.current) {
        pusherRef.current.unsubscribe(channelName);
        channelRef.current = null;
      }
    };
  }, [groupId]);

  const initializeMessages = useCallback((initialMessages) => {
    console.log(
      `📥 Setting initial messages: ${initialMessages.length} messages`
    );
    setMessages(initialMessages);
    setIsLoadingMessages(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsLoadingMessages(true);
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) {
        console.warn("⚠️ Duplicate message prevented:", message.id);
        return prev;
      }

      return [...prev, message];
    });
  }, []);

  // ✅ Add this back
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
    );
  }, []);

  return {
    messages,
    isConnected,
    isLoadingMessages,
    initializeMessages,
    clearMessages,
    addMessage,
    updateMessageStatus,
  };
};
