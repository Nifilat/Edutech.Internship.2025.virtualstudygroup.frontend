import React, { useState, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { studyGroupAPI } from "../lib/api";

const Chatroom = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Chat");
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "User",
      message:
        "As a student, I want to search for and join an existing study group so I can collaborate with peers in my class and program.",
      time: "2:30 PM",
      isOwn: false,
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      sender: "User",
      message:
        "As a student, I want to search for and join an existing study group so I can collaborate with peers in my class and program.",
      time: "2:32 PM",
      isOwn: false,
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 3,
      sender: "You",
      message: "Add a new member to the group. So you should say Hi",
      time: "2:35 PM",
      isOwn: true,
    },
  ]);
  const [chats, setChats] = useState([]);

  const { getUser } = useAuth();
  const user = getUser();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Fetch both groups and courses
        const [groupsData, coursesData] = await Promise.all([
          studyGroupAPI.getUserGroups(),
          studyGroupAPI.getCourses(),
        ]);

        if (groupsData?.data?.length) {
          // Create a courses map for quick lookup
          const coursesMap = new Map(
            coursesData?.map((course) => [course.id.toString(), course]) || []
          );

          // Transform API groups into chat objects with course info
          const transformed = groupsData.data
            .filter((group) => group && group.id) // Filter out null/undefined groups
            .map((group) => {
              const course = coursesMap.get(group.course_id);
              
              return {
                id: group.id,
                groupId: group.group_id,
                name: group.group_name,
                courseCode: course?.course_code || `Course ${group.course_id}`,
                courseName: course?.course_name || "",
                lastMessage: group.description || "Start chatting...",
                time: new Date(group.updated_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                avatar: null,
                isGroup: true,
                unreadCount: 0,
              };
            });

          setChats(transformed);
          if (transformed.length > 0) {
            setSelectedChat(transformed[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    fetchGroups();
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setLoading(true);

    const newMessage = {
      id: messages.length + 1,
      sender: user ? `${user.first_name} ${user.last_name}` : "You",
      message: message.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setLoading(false);
    }, 300);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            handleInputKeyDown={handleInputKeyDown}
            loading={loading}
            isSendDisabled={!message.trim() || loading}
            messages={messages}
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