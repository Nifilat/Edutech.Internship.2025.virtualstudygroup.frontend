import { useEffect, useState, useCallback, useRef } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const useLaravelEcho = (groupId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const echoRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;

    // ✅ initialize Echo only once
    if (!echoRef.current) {
      echoRef.current = new Echo({
        broadcaster: "pusher",
        key: "ediify-key",
        cluster: "mt1",
        wsHost: "ediifyapi.tife.com.ng",
        wsPort: 6001,
        wssPort: 6001,
        forceTLS: true,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
      });

      // connection state listeners
      echoRef.current.connector.pusher.connection.bind("connected", () => {
        console.log("Pusher connected");
        setIsConnected(true);
      });
      echoRef.current.connector.pusher.connection.bind("disconnected", () => {
        console.log("Pusher disconnected");
        setIsConnected(false);
      });
      echoRef.current.connector.pusher.connection.bind("error", (error) => {
        console.error("Pusher connection error:", error);
        setIsConnected(false);
      });
    }

    // ✅ unsubscribe from previous group channel
    echoRef.current.leave(`group.${groupId}`);

    // ✅ subscribe to the new group channel
    const channel = echoRef.current.channel(`group.${groupId}`);

    channel
      .listen("GroupMessageSent", (event) => {
        console.log("New message received:", event);

        const formattedMessage = {
          id: event.message?.id || event.id,
          group_id: event.message?.group_id || event.group_id,
          user_id: event.message?.user_id || event.user?.id,
          message: event.message?.message || event.message,
          created_at: event.message?.created_at || event.created_at,
          updated_at: event.message?.updated_at || event.updated_at,
          user: event.user || event.message?.user,
        };

        setMessages((prev) => [...prev, formattedMessage]);
      })
      .subscribed(() => {
        console.log(`✅ Subscribed to group.${groupId}`);
      })
      .error((error) => {
        console.error("Channel subscription error:", error);
      });

    return () => {
      // ❌ don't disconnect the whole Echo here
      echoRef.current.leave(`group.${groupId}`);
    };
  }, [groupId]);

  const sendMessage = useCallback(() => {
    return false;
  }, []);

  return {
    messages,
    sendMessage,
    isConnected,
    setMessages,
  };
};
