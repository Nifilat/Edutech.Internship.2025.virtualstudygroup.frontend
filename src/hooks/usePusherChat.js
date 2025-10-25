import { useEffect, useState, useCallback, useRef, act } from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";

export const usePusherChat = (groupId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeCallInfo, setActiveCallInfo] = useState({
    isActive: false,
    roomUrl: null,
    hostUrl: null,
    startedBy: null,
  })
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const currentGroupRef = useRef(null);

  // Initialize Pusher ONCE
  useEffect(() => {
    if (pusherRef.current) return;

    // Detect environment
    const isLocalhost = window.location.hostname === "localhost" || 
                       window.location.hostname === "127.0.0.1";
    const isSecure = window.location.protocol === "https:";

    console.log(`🚀 Initializing Pusher...`);
    console.log(`   Environment: ${isLocalhost ? 'Local' : 'Production'}`);
    console.log(`   Protocol: ${isSecure ? 'HTTPS' : 'HTTP'}`);
    
    Pusher.logToConsole = true;

    const pusherConfig = {
      cluster: "mt1",
      wsHost: "ediifyapi.tife.com.ng",
      forceTLS: true, // ✅ Always use TLS/SSL
      enabledTransports: ["ws", "wss"], // ✅ Allow both, Pusher will choose
      encrypted: true, // ✅ Always encrypted
      enableStats: false,
      authEndpoint: null, // Set this if you need authentication
      disableStats: true,
    };

    // ✅ Only set custom ports for localhost
    if (isLocalhost) {
      pusherConfig.wsPort = 6001;
      pusherConfig.wssPort = 6001;
      pusherConfig.forceTLS = false;
      pusherConfig.encrypted = false;
      pusherConfig.enabledTransports = ["ws"];
    }
    // ✅ For production, don't set wsPort/wssPort - let it use defaults (80/443)

    console.log("📡 Pusher Config:", pusherConfig);

    pusherRef.current = new Pusher("ediify-key", pusherConfig);

    pusherRef.current.connection.bind("state_change", (states) => {
      console.log(`🔄 Pusher state: ${states.previous} → ${states.current}`);
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

    pusherRef.current.connection.bind("error", (err) => {
      console.error("❌ Pusher connection error:", err);
    });

    pusherRef.current.connection.bind("failed", () => {
      console.error("❌ Pusher connection failed");
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
    if (!groupId || !pusherRef.current || !pusherRef.current.connection) {
      console.log("⏸️ No groupId or Pusher not ready");
      setActiveCallInfo({ isActive: false, roomUrl: null, hostUrl: null, startedBy: null });
      return;
    }

    // Already subscribed to this channel
    if (currentGroupRef.current === groupId && channelRef.current) {
      console.log(`✅ Already subscribed to group.${groupId}`);
      return;
    }

    // Unsubscribe from previous channel
    if (channelRef.current && currentGroupRef.current !== groupId) {
      const oldChannel = `group.${currentGroupRef.current}`;
      console.log(`👋 Unsubscribing from ${oldChannel}`);
      pusherRef.current.unsubscribe(oldChannel);
      channelRef.current = null;
      setActiveCallInfo({ isActive: false, roomUrl: null, hostUrl: null, startedBy: null });
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
        console.log("📨 Raw event data received:", eventData);
        
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
          status: msg.status || "sent",
        };

        console.log("✅ Formatted message:", formattedMessage);

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
          console.log(`📊 Total messages now: ${newMessages.length}`);
          return newMessages;
        });
      } catch (error) {
        console.error("❌ Error processing message:", error);
        console.error("❌ Error stack:", error.stack);
      }
    });

    // ✨ Listen for meeting.started
    channelRef.current.bind("meeting.started", (data) => {
      console.log("📞 Call Started Event Received:", data);
      if (data?.meeting?.roomUrl && data?.meeting?.hostRoomUrl) {
         // Assuming guest_url is the main roomUrl for joining
        const guestUrl = data.meeting.roomUrl;
        const hostUrl = data.meeting.hostRoomUrl; // Get host URL
        setActiveCallInfo({
          isActive: true,
          roomUrl: guestUrl, // Use guest URL for joining by default
          hostUrl: hostUrl,   // Store host URL
          // Optional: Extract who started it if available in 'data'
          startedBy: data.startedBy || null,
        });
        toast.info("A call has started in this group!"); // Notify user
      } else {
          console.error("❌ Invalid meeting.started event payload:", data);
      }
    });

    // ✨ Listen for meeting.ended
    channelRef.current.bind("meeting.ended", (data) => {
      console.log("📞 Call Ended Event Received:", data);
      setActiveCallInfo({
        isActive: false,
        roomUrl: null,
        hostUrl: null,
        startedBy: null,
      });
      toast.info("The call in this group has ended."); // Notify user
    });

    // Cleanup
    return () => {
      if (channelRef.current && pusherRef.current) {
        console.log(`🧹 Cleaning up subscription for ${channelName}`);
        channelRef.current.unbind_all();
        pusherRef.current.unsubscribe(channelName);
        channelRef.current = null;
      }
    };
  }, [groupId]);

  const initializeMessages = useCallback((initialMessages) => {
    console.log(
      `🔥 Setting initial messages: ${initialMessages.length} messages`
    );
    setMessages(initialMessages);
    setIsLoadingMessages(false);
  }, []);

  const clearMessages = useCallback(() => {
    console.log("🧹 Clearing messages");
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

  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
    );
  }, []);

  return {
    messages,
    isConnected,
    isLoadingMessages,
    activeCallInfo,
    initializeMessages,
    clearMessages,
    addMessage,
    updateMessageStatus,
  };
};