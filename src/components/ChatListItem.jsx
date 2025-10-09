import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserGroup } from "./icons";
import { Check, CheckCheck } from "lucide-react";

function ChatListItem({ chat, isActive, onClick }) {
  const renderChatAvatar = () => {
    if (chat.isGroup) {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <UserGroup className="" />
        </div>
      );
    }
    
    return (
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback className="bg-orange-200 text-orange-800">
            {chat.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        {chat.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
      }`}
    >
      <div className="flex items-center flex-1 min-w-0">
        {renderChatAvatar()}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-black-normal truncate">
              {chat.name}
            </h3>
            <span className="text-xs text-orange-normal ml-2 whitespace-nowrap">
              {(chat.time).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center mt-1">
            {chat.lastMessageFromMe && (
              <div className="mr-1 flex-shrink-0">
                {chat.lastMessageRead ? (
                  <CheckCheck className="w-4 h-4 text-blue-500" />
                ) : chat.lastMessageDelivered ? (
                  <CheckCheck className="w-4 h-4 text-gray-400" />
                ) : (
                  <Check className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
            <p className="text-sm text-gray-500 truncate">
              {chat.lastMessage}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end ml-2">
        {chat.isPinned && (
          <div className="w-4 h-4 mb-1">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12L8 10H12L10 12Z" />
            </svg>
          </div>
        )}
        {chat.unreadCount > 0 && (
          <div className="w-5 h-5 bg-orange-normal text-white text-xs rounded-full flex items-center justify-center">
            {chat.unreadCount}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatListItem;