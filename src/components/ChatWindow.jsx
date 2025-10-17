import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { UserGroup, Paperclip, Mic, Send } from "./icons";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import GroupParticipantsPopup from "./GroupParticpantPopup";
import FileUploadDropdown from "../features/chat/components/FileUploadModal";
import { useAuth } from "@/hooks/useAuth";
import { studyGroupAPI, chatAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, X, MoreVertical } from "lucide-react";
import { formatDateSeparator } from "@/lib/formatMessageTime";
import GroupActionsPopup from "./GroupActionsPopup";
import { FileMessage } from "../features/chat/components/FileMessage";
import { ChatHeader } from "../features/chat/components/ChatHeader";
import { JitsiCall } from "../features/call/JitsiCall";
import { MessageContextMenu } from "../features/chat/components/MessageContextMenu";
import { ReplyPreview } from "../features/chat/components/ReplyPreview";

const MessageReactions = ({ reactions }) => {
  if (!reactions || reactions.length === 0) return null;
  return (
    <div className="absolute -bottom-3 left-4 bg-white shadow-md rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
      {reactions.map((r, i) => (
        <span key={i}>{r.emoji}</span>
      ))}
      <span className="ml-1 text-gray-600">{reactions.length}</span>
    </div>
  );
};

const MessageContent = ({ msg }) => {
  if (msg.file) {
    return <FileMessage msg={msg} />;
  }

  const parts = msg.message.split("\n");
  const repliedText = parts[0].startsWith(">")
    ? parts[0].substring(1).trim()
    : null;
  const mainMessage = repliedText ? parts.slice(1).join("\n") : msg.message;

  if (repliedText) {
    return (
      <div className="px-4 py-2">
        <div className="p-2 mb-1 bg-black/5 rounded border-l-2 border-orange-400">
          <p className="text-xs font-semibold text-orange-600">
            {msg.user.first_name}
          </p>
          <p className="text-sm text-gray-600 truncate">{repliedText}</p>
        </div>
        <p
          className="text-sm font-normal"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {mainMessage}
        </p>
      </div>
    );
  }

  return (
    <p
      className="text-sm font-normal px-4 py-2"
      style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
    >
      {msg.message}
    </p>
  );
};

function ChatWindow({
  activeChat,
  echoMessages,
  isEchoConnected,
  isLoadingMessages,
  onSendMessage,
  onRestrictionUpdate,
  onLeaveGroupSuccess,
  onGroupDetailsUpdate,
}) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showParticipantsPopup, setShowParticipantsPopup] = useState(false);
  const [showActionsPopup, setShowActionsPopup] = useState(false);
  const [actionsPopupInitialTab, setActionsPopupInitialTab] =
    useState("overview");
  const [sending, setSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");

  const [isCallActive, setIsCallActive] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [callRoomName, setCallRoomName] = useState(null);

  const [menuState, setMenuState] = useState({
    isOpen: false,
    position: {},
    message: null,
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  useEffect(() => {
    setLocalMessages(echoMessages.map((msg) => ({ ...msg, reactions: [] }))); // Initialize with empty reactions
  }, [echoMessages]);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { getUser } = useAuth();
  const user = getUser();

  useEffect(() => {
    const fetchParticipantsCount = async () => {
      if (!activeChat?.id || !activeChat.isGroup) return;
      try {
        const { data } = await studyGroupAPI.getGroupDetails(activeChat.id);
        const members = data?.members || [];
        setParticipantsCount(members.length);
      } catch (error) {
        console.error("Failed to fetch participants count:", error);
      }
    };

    fetchParticipantsCount();
  }, [activeChat]);

  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [echoMessages, autoScroll]);

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    let messageToSend = message.trim();

    if (replyingTo) {
      const originalMessage = replyingTo.message || "Attachment";
      // Format the reply into a single string
      messageToSend = `> ${originalMessage}\n${messageToSend}`;
    }

    setMessage("");
    setReplyingTo(null);
    setSending(true);
    try {
      // Send the single formatted string to the parent
      await onSendMessage(messageToSend);
    } catch (error) {
      toast.error("Failed to send message");
      setMessage(message.trim()); // Restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (files, type) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("group_id", activeChat.id);
    formData.append("message", file.name);

    try {
      await chatAPI.uploadFile(formData);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "Failed to upload file.");
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartCall = async () => {
    if (isStartingCall) return;
    setIsStartingCall(true);
    try {
      const response = await studyGroupAPI.startCallSession(activeChat.id);
      const meetingLink = response?.data?.join_url;

      if (meetingLink) {
        const roomName = new URL(meetingLink).pathname.substring(1);
        setCallRoomName(roomName);
        setIsCallActive(true);
      } else {
        throw new Error("Meeting link was not provided by the server.");
      }
    } catch (error) {
      console.error("Failed to start call session:", error);
      toast.error(error.response?.data?.message || "Could not start the call.");
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallRoomName(null);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTriggerLeaveFlow = () => {
    setShowParticipantsPopup(false);
    setActionsPopupInitialTab("leave");
    setShowActionsPopup(true);
  };

  const handleLeaveSuccessAndClosePopup = (groupId) => {
    if (onLeaveGroupSuccess) {
      onLeaveGroupSuccess(groupId);
    }
    setShowActionsPopup(false);
  };

  const handleOpenMenu = (event, message) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    setMenuState({
      isOpen: true,
      position: { x: clientX, y: clientY },
      message,
    });
  };

  const handleMenuAction = async (action, message) => {
    switch (action) {
      case "reply":
        setReplyingTo(message);
        break;
      case "copy":
        if (message.message) {
          navigator.clipboard.writeText(message.message);
          toast.success("Message copied to clipboard");
        }
        break;
      case "delete":
        if (window.confirm("Are you sure you want to delete this message?")) {
          try {
            await chatAPI.deleteMessage(message.id);
            toast.success("Message deleted");
            // Assuming Pusher will broadcast the deletion and update the UI
          } catch (error) {
            toast.error("Failed to delete message.");
          }
        }
        break;
      case "pin":
      case "share":
      case "select":
        toast.info(`'${action}' feature is not yet implemented.`);
        break;
      default:
        break;
    }
  };

  const handleReaction = (emoji, targetMessage) => {
    toast.info(`You reacted with ${emoji}. (UI-only for now)`);
    setLocalMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === targetMessage.id) {
          const newReactions = [
            ...(msg.reactions || []),
            { emoji, user: user.first_name },
          ];
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
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

  const filteredMessages = echoMessages.filter((msg) =>
    msg.message?.toLowerCase().includes(messageSearchQuery.toLowerCase())
  );

  const isChatRestrictedForUser =
    activeChat.is_restricted &&
    activeChat.currentUserRole !== "Leader" &&
    activeChat.currentUserRole !== "Admin";

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <ChatHeader
        activeChat={activeChat}
        isEchoConnected={isEchoConnected}
        participantsCount={participantsCount}
        onShowParticipants={() => setShowParticipantsPopup(true)}
        onToggleSearch={() => setIsSearching((prev) => !prev)}
        onShowActions={() => setShowActionsPopup(true)}
        onStartCall={handleStartCall}
      />

      {isSearching && (
        <div className="p-4 border-b border-gray-200 flex items-center">
          <Input
            type="text"
            placeholder="Search messages..."
            value={messageSearchQuery}
            onChange={(e) => setMessageSearchQuery(e.target.value)}
            className="flex-1 mr-2 bg-gray-50 border-gray-200 rounded-full"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsSearching(false);
              setMessageSearchQuery("");
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

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
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-orange-normal" />
          </div>
        ) : filteredMessages && filteredMessages.length > 0 ? (
          (() => {
            let lastDate = null;
            return filteredMessages.map((msg) => {
              const isOwn = msg.user_id == user?.id;
              const messageDate = msg.created_at
                ? formatDateSeparator(msg.created_at)
                : null;
              const showDateSeparator = messageDate && messageDate !== lastDate;
              if (showDateSeparator) {
                lastDate = messageDate;
              }
              let userName = "Unknown User";
              let userInitials = "U";
              if (msg.user) {
                if (msg.user.first_name && msg.user.last_name) {
                  userName = `${msg.user.first_name} ${msg.user.last_name}`;
                  userInitials = `${msg.user.first_name[0]}${msg.user.last_name[0]}`;
                } else if (msg.user.name) {
                  userName = msg.user.name;
                  const nameParts = msg.user.name.split(" ");
                  userInitials =
                    nameParts.length > 1
                      ? `${nameParts[0][0]}${nameParts[1][0]}`
                      : nameParts[0][0];
                }
              }
              const userAvatar = msg.user?.avatar_url || null;
              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {messageDate}
                      </div>
                    </div>
                  )}
                  <div
                    className={`group flex items-start gap-2 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn && (
                      <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                        <AvatarImage src={msg.user?.avatar_url} />
                        <AvatarFallback>
                          {msg.user?.first_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`group flex items-center gap-2 ${
                        isOwn ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className="relative">
                        <div
                          className={`shadow-sm rounded-lg ${
                            isOwn
                              ? "bg-orange-light text-black-normal rounded-br-none"
                              : "bg-white text-black-normal rounded-bl-none"
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs text-orange-normal mb-1 font-medium px-4 pt-2">
                              {msg.user.first_name}
                            </p>
                          )}

                          {/* Use the new MessageContent component */}
                          <MessageContent msg={msg} />
                        </div>
                        <MessageReactions reactions={msg.reactions} />
                      </div>
                      <button
                        onClick={(e) => handleOpenMenu(e, msg)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full self-center hover:bg-black/5"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </React.Fragment>
              );
            });
          })()
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ReplyPreview message={replyingTo} onCancel={() => setReplyingTo(null)} />

      {/* Message Input: Conditionally Rendered */}
      {isChatRestrictedForUser ? (
        <div className="p-4 border-t border-gray-200 text-center bg-gray-50">
          <p className="text-sm text-gray-500">Only admins can send message</p>
        </div>
      ) : (
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
                <img src="/smile.png" alt="Smile" className="w-5 h-5" />
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
            <FileUploadDropdown
              onFileSelect={handleFileSelect}
              disabled={sending}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </FileUploadDropdown>

            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleInputKeyDown}
                aria-label="Type your message"
                disabled={sending || isUploading}
                className="pr-20 bg-gray-50 border-gray-200 rounded-full"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600 w-8 h-8"
                  disabled={sending || isUploading}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  variant={"ghost"}
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-inherit"
                  disabled={!message.trim() || sending || isUploading}
                  aria-label="Send message"
                >
                  {sending || isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <GroupParticipantsPopup
        isOpen={showParticipantsPopup}
        onClose={() => setShowParticipantsPopup(false)}
        groupId={activeChat?.id}
        onTriggerLeaveFlow={handleTriggerLeaveFlow}
      />
      <GroupActionsPopup
        isOpen={showActionsPopup}
        onClose={() => {
          setShowActionsPopup(false);
          setActionsPopupInitialTab("overview");
        }}
        groupId={activeChat?.id}
        onRestrictionUpdate={onRestrictionUpdate}
        initialTab={actionsPopupInitialTab}
        onLeaveSuccess={handleLeaveSuccessAndClosePopup}
        onGroupDetailsUpdate={onGroupDetailsUpdate}
      />

      <Dialog open={isCallActive} onOpenChange={handleEndCall}>
        <DialogContent className="max-w-full w-full h-full p-0 gap-0 border-0">
          {isStartingCall ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Starting call...</span>
            </div>
          ) : (
            callRoomName && (
              <JitsiCall
                roomName={callRoomName}
                userDisplayName={`${user.first_name} ${user.last_name}`}
                onCallEnd={handleEndCall}
              />
            )
          )}
        </DialogContent>
      </Dialog>

      {menuState.isOpen && (
        <MessageContextMenu
          message={menuState.message}
          position={menuState.position}
          onClose={() =>
            setMenuState({ isOpen: false, position: {}, message: null })
          }
          onAction={handleMenuAction}
          onReact={handleReaction}
        />
      )}
    </div>
  );
}

export default ChatWindow;
