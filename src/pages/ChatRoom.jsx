import React, { useState, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { studyGroupAPI, chatAPI } from "../lib/api";
import { useLaravelEcho } from "@/hooks/useLaravelEcho";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatMessageTime } from "../lib/formatMessageTime";

const Chatroom = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Chat");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const { getUser } = useAuth();
  const user = getUser();

  // ✅ ALWAYS call the hook, pass null if no chat selected
  // This ensures hooks are called in the same order every render
  const {
    messages: echoMessages,
    isConnected: isEchoConnected,
    isLoadingMessages,
    initializeMessages,
    clearMessages,
  } = useLaravelEcho(selectedChat?.id || null);

  // 🔹 Fetch user's study groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingChats(true);
      try {
        const [groupsData, coursesData] = await Promise.all([
          studyGroupAPI.getUserGroups(),
          studyGroupAPI.getCourses(),
        ]);

        if (groupsData?.data?.length) {
          const coursesMap = new Map(
            coursesData?.map((course) => [course.id.toString(), course]) || []
          );

          const transformed = groupsData.data
            .filter((group) => group && group.id)
            .map((group) => {
              const course = coursesMap.get(group.course_id);

              return {
                id: group.id,
                groupId: group.group_id,
                name: group.group_name,
                courseCode: course?.course_code || `COURSE ${group.course_id}`,
                courseName: course?.course_name || "",
                lastMessage: group.description || "Start chatting...",
                time: formatMessageTime(group.updated_at),
                avatar: null,
                isGroup: true,
                unreadCount: group.unread_count || 0,
                pendingRequest:
                  Number(group.created_by) === Number(user?.id) &&
                  group.pending_requests?.length > 0
                    ? { userName: group.pending_requests[0].user_name }
                    : null,
              };
            })
            .sort((a, b) => {
              // 1️⃣ If either has unread, sort unread first
              if (b.unreadCount !== a.unreadCount) {
                return b.unreadCount - a.unreadCount;
              }
              // 2️⃣ Otherwise sort by most recent update
              return new Date(b.time) - new Date(a.time);
            });

          setChats(transformed);
          if (transformed.length > 0) {
            setSelectedChat(transformed[0]); // auto-select first group
          }
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchGroups();
  }, [user?.id]);

  // 🔹 Fetch messages when selectedChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?.id) return;

      // Clear previous messages immediately
      clearMessages();

      try {
        const data = await chatAPI.getMessages(selectedChat.id);

        // Ensure messages are properly formatted
        const formatted = (data || []).map((msg) => ({
          ...msg,
          created_at: new Date(msg.created_at).toISOString(),
        }));

        // ✅ Initialize messages (oldest first)
        initializeMessages([...formatted].reverse());

        // ✅ Mark chat as read when opened
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChat.id
              ? { ...chat, unreadCount: 0 }
              : chat
          )
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
        initializeMessages([]);
      }
    };

    fetchMessages();
  }, [selectedChat?.id, clearMessages, initializeMessages]);

  // 🔹 Update unread count when new messages arrive in background
  useEffect(() => {
    if (!echoMessages || echoMessages.length === 0) return;

    const lastMessage = echoMessages[echoMessages.length - 1];
    
    // Only increment unread if message is NOT from current user and chat is NOT active
    if (
      lastMessage &&
      lastMessage.user_id != user?.id &&
      lastMessage.group_id !== selectedChat?.id
    ) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === lastMessage.group_id
            ? {
                ...chat,
                unreadCount: (chat.unreadCount || 0) + 1,
                lastMessage: lastMessage.message,
                time: formatMessageTime(lastMessage.created_at),
              }
            : chat
        )
      );
    }
  }, [echoMessages, user?.id, selectedChat?.id]);

  // 🔹 Handle send message
  const handleSendMessage = async (messageText) => {
    if (!selectedChat?.id) return;

    try {
      // ✅ Send message to backend
      const response = await chatAPI.sendMessage(selectedChat.id, messageText);

      // ✅ DON'T manually add message here - let WebSocket handle it
      // This prevents duplicates since the backend will broadcast via WebSocket
      
      // Optional: Show sending indicator while waiting for WebSocket confirmation
      if (!response?.data) {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      throw error; // Re-throw so ChatWindow can handle it
    }
  };

  if (loadingChats) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-normal" />
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border"
      aria-label="Chatroom"
    >
      {chats && chats.length > 0 ? (
        <>
          <ChatSidebar
            chats={chats}
            activeChat={selectedChat}
            setActiveChat={setSelectedChat}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <ChatWindow
            activeChat={selectedChat}
            echoMessages={echoMessages}
            isEchoConnected={isEchoConnected}
            isLoadingMessages={isLoadingMessages}
            onSendMessage={handleSendMessage}
          />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          No chats available.
        </div>
      )}
    </div>
  );
};

export default Chatroom;