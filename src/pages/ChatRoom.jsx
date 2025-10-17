import React, { useState, useEffect, useCallback } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { studyGroupAPI, chatAPI } from "../lib/api";
import { usePusherChat } from "@/hooks/usePusherChat";
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
    isLoadingMessages,
    initializeMessages,
    clearMessages,
    updateMessageStatus,
  } = usePusherChat(selectedChat?.id || null);

  const fetchChatsList = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoadingChats(true);
    
    try {
      const [groupsData, coursesData] = await Promise.all([
        studyGroupAPI.getUserGroups(),
        studyGroupAPI.getCourses(),
      ]);

      if (groupsData?.data) {
        const coursesMap = new Map(coursesData?.map((c) => [c.id.toString(), c]) || []);
        const transformed = groupsData.data
          .filter((group) => group && group.id)
          .map((group) => {
            const course = coursesMap.get(group.course_id);
            const lastMsg = group.last_message;
            return {
              id: group.id,
              groupId: group.group_id,
              name: group.group_name,
              courseCode: course?.course_code || `COURSE ${group.course_id}`,
              courseName: course?.course_name || "",
              lastMessage: lastMsg?.message || group.description || "Start chatting...",
              time: formatMessageTime(lastMsg?.created_at || group.updated_at),
              avatar: null,
              isGroup: true,
              isPinned: false,
              unreadCount: group.unread_count || 0,
              lastMessageFromMe: lastMsg?.user_id == user?.id,
              lastMessageRead: lastMsg?.status === "read",
              lastMessageDelivered: lastMsg?.status === "delivered",
              is_restricted: group.is_restricted || false,
              currentUserRole: group.current_user_role || "Member",
              pendingRequest:
                Number(group.created_by) === Number(user?.id) &&
                group.pending_requests?.length > 0
                  ? { userName: group.pending_requests[0].user_name }
                  : null,
            };
          });

        transformed.sort((a, b) => new Date(b.time) - new Date(a.time));

        setChats(currentChats => {
            const newChatsMap = new Map(transformed.map(c => [c.id, c]));
            return transformed.map(newChat => {
                const existingChat = currentChats.find(c => c.id === newChat.id);
                return existingChat ? { ...newChat, isPinned: existingChat.isPinned } : newChat;
            });
        });

        if (isInitialLoad && transformed.length > 0 && !selectedChat) {
          setSelectedChat(transformed[0]);
        }
      }
    } catch (err) {
      console.error("Polling/fetch error:", err);
      if (isInitialLoad) toast.error("Failed to load your chats.");
    } finally {
      if (isInitialLoad) setLoadingChats(false);
    }
  // ✨ FIX: Removed selectedChat from dependency array to stabilize the function
  }, [user?.id]); 

  // Initial load
  useEffect(() => {
    fetchChatsList(true);
  }, [fetchChatsList]);

  // Periodic polling for background updates
  useEffect(() => {
    const intervalId = setInterval(() => fetchChatsList(false), 20000);
    return () => clearInterval(intervalId);
  }, [fetchChatsList]);

  // ✨ NEW: Instant refresh when the user focuses on the tab
  useEffect(() => {
    const handleFocus = () => fetchChatsList(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchChatsList]);

  // Fetch detailed group info when a chat is selected
  useEffect(() => {
    const fetchRoleAndDetails = async () => {
      if (!selectedChat?.id || !user?.id) return;
      try {
        const { data } = await studyGroupAPI.getGroupDetails(selectedChat.id);
        const members = data?.members || [];
        const currentMember = members.find((m) => m.user.id === user.id);
        const role = currentMember?.role || "Member";
        setSelectedChat((prev) =>
          prev && prev.id === selectedChat.id
            ? { ...prev, currentUserRole: role }
            : prev
        );
      } catch (error) {
        console.error("Failed to fetch group details for role:", error);
      }
    };
    fetchRoleAndDetails();
  }, [selectedChat?.id, user?.id]);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?.id) return;
      clearMessages();
      try {
        const data = await chatAPI.getMessages(selectedChat.id);
        const formatted = (data || []).map((msg) => ({
          ...msg,
          created_at: new Date(msg.created_at).toISOString(),
        }));
        initializeMessages([...formatted].reverse());

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat
          )
        );
        setTimeout(() => {
          formatted.forEach((msg) => {
            if (msg.user_id != user?.id) updateMessageStatus(msg.id, "read");
          });
        }, 1000);
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
        initializeMessages([]);
      }
    };
    fetchMessages();
  }, [
    selectedChat?.id,
    clearMessages,
    initializeMessages,
    updateMessageStatus,
    user?.id,
  ]);

  // Update chat list when new messages arrive (for the active chat)
  useEffect(() => {
    if (!echoMessages || echoMessages.length === 0) return;
    const lastMessage = echoMessages[echoMessages.length - 1];
    if (!lastMessage) return;
    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) => {
        if (chat.id === lastMessage.group_id) {
          const isFromMe = lastMessage.user_id == user?.id;
          const isActiveChat = chat.id === selectedChat?.id;
          return {
            ...chat,
            lastMessage: lastMessage.message,
            time: formatMessageTime(lastMessage.created_at),
            lastMessageFromMe: isFromMe,
            lastMessageRead: lastMessage.status === "read",
            lastMessageDelivered: lastMessage.status === "delivered",
            unreadCount:
              !isFromMe && !isActiveChat
                ? (chat.unreadCount || 0) + 1
                : isActiveChat
                ? 0
                : chat.unreadCount,
          };
        }
        return chat;
      });
      return updatedChats;
    });
    if (
      lastMessage.group_id === selectedChat?.id &&
      lastMessage.user_id != user?.id
    ) {
      setTimeout(() => updateMessageStatus(lastMessage.id, "read"), 500);
    }
  }, [echoMessages, user?.id, selectedChat?.id]);

  const handleSendMessage = async (payload) => {
    if (!selectedChat?.id) return;
    try {
      const response = await chatAPI.sendMessage(selectedChat.id, payload);
      if (!response?.data) throw new Error("Failed to send message");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      throw error;
    }
  };

  const handlePinToggle = (chatId) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
  };

  const handleRestrictionUpdate = (chatId, isRestricted) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, is_restricted: isRestricted } : chat
      )
    );
    if (selectedChat?.id === chatId) {
      setSelectedChat((prev) => ({ ...prev, is_restricted: isRestricted }));
    }
  };

  const handleLeaveGroupSuccess = (groupId) => {
    const originalChats = [...chats];
    const updatedChats = originalChats.filter((c) => c.id !== groupId);
    setChats(updatedChats);
    if (selectedChat?.id === groupId) {
      if (updatedChats.length > 0) {
        const removedIndex = originalChats.findIndex((c) => c.id === groupId);
        const newIndex = Math.max(0, removedIndex - 1);
        setSelectedChat(updatedChats[newIndex]);
      } else {
        setSelectedChat(null);
      }
    }
  };

  const handleGroupDetailsUpdate = (groupId, updatedData) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === groupId ? { ...chat, ...updatedData } : chat
      )
    );
    if (selectedChat?.id === groupId) {
      setSelectedChat((prev) => ({ ...prev, ...updatedData }));
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
            onPinToggle={handlePinToggle}
          />
          <ChatWindow
            activeChat={selectedChat}
            echoMessages={echoMessages}
            isEchoConnected={isEchoConnected}
            isLoadingMessages={isLoadingMessages}
            onSendMessage={handleSendMessage}
            onRestrictionUpdate={handleRestrictionUpdate}
            onLeaveGroupSuccess={handleLeaveGroupSuccess}
            onGroupDetailsUpdate={handleGroupDetailsUpdate}
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
