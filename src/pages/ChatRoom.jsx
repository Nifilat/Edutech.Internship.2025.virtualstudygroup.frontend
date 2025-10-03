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

  const {
    messages: echoMessages,
    isConnected: isEchoConnected,
    setMessages,
  } = useLaravelEcho(selectedChat?.id);

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
                  group.created_by === user?.id &&
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

  // 🔹 Fetch messages whenever selectedChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?.id) return;

      try {
        const data = await chatAPI.getMessages(selectedChat.id);

        // Ensure messages are properly formatted
        const formatted = (data || []).map((msg) => ({
          ...msg,
          created_at: new Date(msg.created_at).toISOString(), // safe string
        }));

        // Oldest first
        setMessages([...formatted].reverse());
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
  }, [selectedChat?.id, setMessages]);

  // 🔹 Handle send message
  const handleSendMessage = async (messageText) => {
    if (!selectedChat?.id) return;

    try {
      const response = await chatAPI.sendMessage(selectedChat.id, messageText);

      if (response?.data) {
        const newMessage = {
          ...response.data,
          user_id: user?.id,
          user_name: `${user?.first_name} ${user?.last_name}`,
          user_avatar: user?.avatar_url,
          created_at: new Date().toISOString(),
        };

        // Optimistic update so message shows immediately
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
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
