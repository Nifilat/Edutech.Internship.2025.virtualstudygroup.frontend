import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import {
  UserGroup,
  AddTeam,
  Phone,
  Video,
  Search,
  MoreHorizontal,
  Paperclip,
  Mic,
  Send,
} from "./icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import GroupParticipantsPopup from "./GroupParticpantPopup";
import { useAuth } from "@/hooks/useAuth";
import { chatAPI } from "@/lib/api";
import { toast } from "sonner";

function ChatWindow({
  activeChat,
  echoMessages,
  isEchoConnected,
  onSendMessage,
}) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showParticipantsPopup, setShowParticipantsPopup] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { getUser } = useAuth();
  const user = getUser();

  const participantsCount = 20;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [echoMessages]);

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    const messageText = message.trim();
    setMessage("");
    setSending(true);

    try {
      await onSendMessage(messageText);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4">
            <UserGroup className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500">
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  const renderChatAvatar = () => {
    if (activeChat.isGroup) {
      return (
        <div className="flex items-center justify-center">
          <UserGroup />
        </div>
      );
    }

    return (
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
          <AvatarFallback className="bg-orange-200 text-orange-800">
            {activeChat.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {renderChatAvatar()}
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeChat.name}
            </h2>
            <div className="flex items-center gap-2">
              {!isEchoConnected && (
                <span className="text-xs text-gray-400">(Connecting...)</span>
              )}
              {isEchoConnected && (
                <span className="text-xs text-green-500 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Live
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-orange-normal hover:text-orange-dark relative"
            onClick={() => setShowParticipantsPopup(true)}
          >
            <AddTeam className="" />
            <div className="absolute top-1 right-1 bg-orange-normal text-white text-[6px] rounded-full w-3 h-3 flex items-center justify-center font-medium">
              {participantsCount}
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-orange-normal hover:text-orange-dark"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-orange-normal hover:text-orange-dark"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-orange-normal hover:text-orange-dark"
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-orange-normal hover:text-orange-dark"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Pending Request Banner */}
      {activeChat.isGroup && activeChat.pendingRequest && (
        <div className="bg-orange-50 border-b border-orange-100 px-4 py-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium">
              {activeChat.pendingRequest.userName}
            </span>{" "}
            Requested to join
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {echoMessages && echoMessages.length > 0 ? (
          echoMessages.map((msg) => {
            const isOwn = msg.user_id == user?.id; // Use == for type coercion since backend returns strings
            const userName = msg.user
              ? `${msg.user.first_name} ${msg.user.last_name}`
              : "Unknown User";
            const userAvatar = msg.user?.avatar_url || null;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    isOwn ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isOwn && (
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-orange-200 text-orange-800 text-xs">
                        {msg.user
                          ? `${msg.user.first_name[0]}${msg.user.last_name[0]}`
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn
                        ? "bg-orange-light text-black-normal rounded-br-none"
                        : "bg-orange-light text-black-normal rounded-bl-none"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs text-gray-600 mb-1 font-medium">
                        {userName}
                      </p>
                    )}
                    <p className="text-sm font-normal">{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600"
              type="button"
              aria-label="Add emoji"
              onClick={() => setShowEmojiPicker((v) => !v)}
            >
              <img
                src="/smile.png"
                alt="Smile"
                className="w-5 h-5"
              />
            </Button>
            {showEmojiPicker && (
              <div className="absolute z-50 bottom-12 left-0">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleInputKeyDown}
              aria-label="Type your message"
              disabled={sending}
              className="pr-20 bg-gray-50 border-gray-200 rounded-full"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600 w-8 h-8"
                disabled={sending}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                variant={"ghost"}
                onClick={handleSendMessage}
                size="icon"
                className="bg-inherit"
                disabled={!message.trim() || sending}
                aria-label="Send message"
              >
                {sending ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                ) : (
                  <Send className="" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <GroupParticipantsPopup
        isOpen={showParticipantsPopup}
        onClose={() => setShowParticipantsPopup(false)}
        groupId={activeChat?.id}
      />
    </div>
  );
}

export default ChatWindow;
