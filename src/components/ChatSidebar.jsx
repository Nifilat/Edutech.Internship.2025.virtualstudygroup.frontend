import React from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ChatListItem from "./ChatListItem";

function ChatSidebar({ 
  chats, 
  activeChat, 
  setActiveChat, 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab 
}) {
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'Unread') {
      return matchesSearch && chat.unreadCount > 0;
    }
    
    return matchesSearch;
  });

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search or start a new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 rounded-full"
          />
        </div>
      </div>

      {/* Chat/Unread Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('Chat')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'Chat'
              ? 'text-white bg-orange-normal'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('Unread')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'Unread'
              ? 'text-white bg-orange-normal'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {activeTab === 'Unread' ? 'No unread messages' : 'No chats found'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={activeChat?.id === chat.id}
              onClick={() => setActiveChat(chat)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;