import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserGroup, Pin } from "./icons";
import { Check, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const DoubleTickIcon = ({ read }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ fill: read ? "#2361FF" : "#808080" }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.3246 5.16599C11.555 5.39108 11.5594 5.7604 11.3343 5.99089L5.63773 11.8242C5.52294 11.9418 5.36391 12.0055 5.19972 11.9996C5.03553 11.9938 4.88141 11.919 4.77524 11.7937L2.30519 8.87699C2.09698 8.63114 2.1275 8.26305 2.37335 8.05485C2.6192 7.84665 2.98728 7.87716 3.19549 8.12301L5.2511 10.5503L10.4997 5.17577C10.7247 4.94528 11.0941 4.9409 11.3246 5.16599Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.6576 5.16599C14.8881 5.39108 14.8924 5.7604 14.6673 5.99089L8.97073 11.8242C8.85595 11.9418 8.69692 12.0055 8.53273 11.9996C8.36854 11.9938 8.21442 11.919 8.10824 11.7937L5.6382 8.87699C5.42999 8.63114 5.46051 8.26305 5.70636 8.05485C5.95221 7.84665 6.32029 7.87716 6.52849 8.12301L8.5841 10.5503L13.8327 5.17577C14.0577 4.94528 14.4271 4.9409 14.6576 5.16599Z"
    />
  </svg>
);

function ChatListItem({ chat, isActive, onClick, onPinToggle }) {
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
            {chat.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
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
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors group ${
        isActive ? "bg-blue-50 border-r-2 border-blue-500" : ""
      }`}
    >
      <div
        className="flex items-center flex-1 min-w-0"
        onClick={() => onClick(chat)}
      >
        {renderChatAvatar()}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-black-normal truncate">
              {chat.name}
            </h3>
            <span className="text-[9px] text-orange-normal font-medium ml-2 whitespace-nowrap">
              {chat.time.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center min-w-0">
              {chat.lastMessageFromMe && (
                <div className="mr-1 flex-shrink-0">
                  {chat.lastMessageRead ? (
                    <DoubleTickIcon read={true} />
                  ) : chat.lastMessageDelivered ? (
                    <DoubleTickIcon read={false} />
                  ) : (
                    <Check className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              )}
              <p className="text-xs text-black-normal truncate">
                {chat.lastMessage}
              </p>
            </div>
            <div className="flex items-center ml-2 space-x-2 flex-shrink-0">
              {chat.isPinned && <Pin className="w-5 h-5 text-[#525866]" />}
            </div>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onPinToggle(chat.id)}>
            {chat.isPinned ? "Unpin Chat" : "Pin Chat"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ChatListItem;
