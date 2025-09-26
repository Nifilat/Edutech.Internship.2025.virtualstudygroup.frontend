import React, { useState, useRef } from "react";
// import Picker from '@emoji-mart/react';
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
import { messages } from "../data/chatData";

function ChatWindow({
  activeChat,
  message,
  setMessage,
  handleSendMessage,
  handleInputKeyDown,
  loading,
  isSendDisabled,
}) {
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  const handleEmojiSelect = (emoji) => {
    // emoji-mart v5+ uses emoji.native for the emoji character
    setMessage((prev) => prev + (emoji.native || emoji.emojis || ""));
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };
  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className=" flex items-center justify-center mx-auto mb-4">
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
        <div className=" flex items-center justify-center">
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
        {activeChat.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        )}
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
            {activeChat.isOnline && (
              <p className="text-sm text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Online
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-orange-normal hover:text-orange-dark"
          >
            <AddTeam className="" />
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

      {/* Messages Area */}
      <div className="flex flex-col gap-16 flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-xs lg:max-w-md ${
                msg.isOwn ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {!msg.isOwn && (
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage src={msg.avatar} alt={msg.sender} />
                  <AvatarFallback className="bg-orange-200 text-orange-800 text-xs">
                    {msg.sender
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.isOwn
                    ? "bg-orange-light text-black-normal rounded-br-none"
                    : "bg-orange-light text-black-normal rounded-bl-none"
                }`}
              >
                <p className="text-sm font-normal">{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
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
              // onClick={() => setShowEmojiPicker((v) => !v)}
            >
              <img
                src="src/components/icons/smile.png"
                alt="Smile"
                className="w-5 h-5"
              />
            </Button>
            {/* 
            {showEmojiPicker && (
              <div className="absolute z-50 bottom-12 left-0">
                <Picker onSelect={handleEmojiSelect} theme="light" />
              </div>
            )} 
            */}
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
              disabled={loading}
              className="pr-20 bg-gray-50 border-gray-200 rounded-full"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600 w-8 h-8"
                disabled={loading}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                variant={"ghost"}
                onClick={handleSendMessage}
                size="icon"
                className="bg-inherit ho"
                disabled={isSendDisabled}
                aria-label="Send message"
              >
                {loading ? (
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
    </div>
  );
}

export default ChatWindow;
