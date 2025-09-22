import React, { useState } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import { chats } from '@/data/chatData';

const Chatroom = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Chat');
  const [selectedChat, setSelectedChat] = useState(chats[1]); // Duke Manni selected by default
  const [loading, setLoading] = useState(false);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setLoading(true);
    setTimeout(() => {
      console.log('Sending message:', message);
      setMessage('');
      setLoading(false);
    }, 300); // Simulate async send
  };

  // Handle Enter key for sending message
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border" aria-label="Chatroom">
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
          />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-400">No chats available.</div>
      )}
    </div>
  );
};

export default Chatroom;