import React, { useState } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import { chats } from '@/data/chatData';

const Chatroom = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Chat');
  const [selectedChat, setSelectedChat] = useState(chats[1]);

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border">
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
      />
    </div>
  );
};

export default Chatroom;