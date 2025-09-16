import React, { useState } from 'react';
import { Search, Users, Phone, Video, MoreHorizontal, Paperclip, Smile, Mic, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Chatroom = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Chat');

  // Mock chat data
  const chatList = [
    {
      id: 1,
      name: 'Engineering III (024)',
      lastMessage: 'Haha oh man',
      time: '05:14 PM',
      avatar: null,
      isGroup: true,
      unreadCount: 0,
      isPinned: true
    },
    {
      id: 2,
      name: 'Duke Manni',
      lastMessage: 'Haha that\'s terrifying 😂',
      time: '07:38 AM',
      avatar: 'https://i.pravatar.cc/150?img=2',
      isGroup: false,
      unreadCount: 0,
      isOnline: true
    },
    {
      id: 3,
      name: 'Statistics III (024)',
      lastMessage: 'perfect!',
      time: '11:49 PM',
      avatar: null,
      isGroup: true,
      unreadCount: 3
    },
    {
      id: 4,
      name: 'Adeola Manni',
      lastMessage: 'omg, this is amazing...',
      time: '07:40 AM',
      avatar: 'https://i.pravatar.cc/150?img=4',
      isGroup: false,
      unreadCount: 1
    },
    {
      id: 5,
      name: 'Statistics III (024)',
      lastMessage: 'aww',
      time: '08:20 PM',
      avatar: null,
      isGroup: true,
      unreadCount: 1
    },
    {
      id: 6,
      name: 'Statistics III (024)',
      lastMessage: 'I\'ll be there in 2 minutes',
      time: '01:09 AM',
      avatar: null,
      isGroup: true,
      unreadCount: 1
    },
    {
      id: 7,
      name: 'Darrell Steward',
      lastMessage: 'Haha that\'s terrifying 😂',
      time: '01:55 PM',
      avatar: 'https://i.pravatar.cc/150?img=7',
      isGroup: false,
      unreadCount: 1
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'User',
      message: 'As a student, I want to search for and join an existing study group so I can collaborate with peers in my class and program.',
      time: '2:30 PM',
      isOwn: false,
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      sender: 'User',
      message: 'As a student, I want to search for and join an existing study group so I can collaborate with peers in my class and program.',
      time: '2:32 PM',
      isOwn: false,
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 3,
      sender: 'You',
      message: 'Add a new member to the group. So you should say Hi',
      time: '2:35 PM',
      isOwn: true
    }
  ];

  const [selectedChat, setSelectedChat] = useState(chatList[1]); // Duke Manni selected by default

  const filteredChats = chatList.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const renderChatAvatar = (chat) => {
    if (chat.isGroup) {
      return (
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-gray-500" />
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
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border">
      {/* Left Sidebar - Chat List */}
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
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center flex-1 min-w-0">
                {renderChatAvatar(chat)}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {chat.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {chat.lastMessage}
                  </p>
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
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                {renderChatAvatar(selectedChat)}
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedChat.name}
                  </h2>
                  {selectedChat.isOnline && (
                    <p className="text-sm text-green-500 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Online
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-orange-normal hover:text-orange-dark">
                  <Users className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-orange-normal hover:text-orange-dark">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-orange-normal hover:text-orange-dark">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-orange-normal hover:text-orange-dark">
                  <Search className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-orange-normal hover:text-orange-dark">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!msg.isOwn && (
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src={msg.avatar} alt={msg.sender} />
                        <AvatarFallback className="bg-orange-200 text-orange-800 text-xs">
                          {msg.sender.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        msg.isOwn
                          ? 'bg-orange-normal text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <Smile className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Type message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-20 bg-gray-50 border-gray-200 rounded-full"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 w-8 h-8">
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      size="icon" 
                      className="bg-orange-normal hover:bg-orange-dark text-white w-8 h-8"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatroom;