import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserGroup,
  AddTeam,
  Phone,
  Video,
  Search,
  MoreHorizontal,
} from "@/components/icons";

const renderChatAvatar = (activeChat) => {
  if (activeChat.isGroup) {
    return (
      <div className="flex items-center justify-center">
        <UserGroup />
      </div>
    );
  }

  return (
    <Avatar className="w-12 h-12">
      <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
      <AvatarFallback className="bg-orange-200 text-orange-800">
        {activeChat.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
};

export const ChatHeader = ({
  activeChat,
  isEchoConnected,
  participantsCount,
  onShowParticipants,
  onToggleSearch,
  onShowActions,
  onStartCall,
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {renderChatAvatar(activeChat)}
        <div className="ml-3 min-w-0">
          <h2 className="text-lg font-medium text-black-normal truncate">
            {activeChat.name}
          </h2>
          <div className="flex items-center gap-2">
            {!isEchoConnected && (
              <span className="text-xs text-gray-400">(Connecting...)</span>
            )}
            {isEchoConnected && (
              <span className="text-xs text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Online
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
          onClick={onShowParticipants}
        >
          <AddTeam />
          {activeChat.isGroup && (
            <div className="absolute top-1 right-1 bg-orange-normal text-white text-[6px] rounded-full w-3 h-3 flex items-center justify-center font-medium">
              {participantsCount}
            </div>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-orange-normal hover:text-orange-dark"
          onClick={onStartCall}
        >
          <Phone className="w-5 h-5"  />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-orange-normal hover:text-orange-dark"
          onClick={onStartCall}
        >
          <Video className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-orange-normal hover:text-orange-dark"
          onClick={onToggleSearch}
        >
          <Search className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-orange-normal hover:text-orange-dark"
          onClick={onShowActions}
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
