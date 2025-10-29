import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { UserGroup, Paperclip, Mic, Send, Phone } from "./icons";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import GroupParticipantsPopup from "./GroupParticpantPopup";
import FileUploadDropdown from "../features/chat/components/FileUploadModal";
import { useAuth } from "@/hooks/useAuth";
import { studyGroupAPI, chatAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, X, MoreVertical, Trash2, Check } from "lucide-react";
import { formatDateSeparator } from "@/lib/formatMessageTime";
import GroupActionsPopup from "./GroupActionsPopup";
import { FileMessage } from "../features/chat/components/FileMessage";
import { ChatHeader } from "../features/chat/components/ChatHeader";
import { WherebyCall } from "../features/call/WherebyCall";
import { MessageContextMenu } from "../features/chat/components/MessageContextMenu";
import { ReplyPreview } from "../features/chat/components/ReplyPreview";
import { Linkify } from "../utils/linkify";

const MessageReactions = ({ reactions }) => {
  if (!reactions || reactions.length === 0) return null;
  const uniqueEmojis = [...new Set(reactions.map((r) => r.emoji))];
  return (
    <div className="absolute -bottom-3 left-4 bg-white shadow-md rounded-full px-1.5 py-0.5 text-xs flex items-center gap-1 cursor-pointer">
      {uniqueEmojis.slice(0, 3).map((emoji, i) => (
        <span key={i}>{emoji}</span>
      ))}
      <span className="ml-1 text-gray-600 font-medium">{reactions.length}</span>
    </div>
  );
};

const MessageContent = ({ msg, allMessages }) => {
  if (msg.file || msg.voice_note) {
    return <FileMessage msg={msg} />;
  }

  // Check if this message is a reply to another message
  if (msg.replying_to_id) {
    const originalMessage = allMessages.find(
      (m) => m.id === msg.replying_to_id
    );

    if (originalMessage) {
      return (
        <div className="px-4 py-2">
          <div className="p-2 mb-1 bg-black/5 rounded border-l-2 border-orange-400">
            <p className="text-xs font-semibold text-orange-600">
              {originalMessage.user.first_name}
            </p>
            <p className="text-sm text-gray-600 truncate">
              <Linkify text={originalMessage.message || "Attachment"} />
            </p>
          </div>
          <p
            className="text-sm font-normal"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            <Linkify text={msg.message} />
          </p>
        </div>
      );
    }
  }

  // Default rendering for a normal message
  return (
    <p
      className="text-sm font-normal px-4 py-2"
      style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
    >
      <Linkify text={msg.message} />
    </p>
  );
};

function ChatWindow({
  activeChat,
  echoMessages,
  isEchoConnected,
  isLoadingMessages,
  activeCallInfo,
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
  const [callUrl, setCallUrl] = useState(null);
  const [isJoiningCall, setIsJoiningCall] = useState(false);

  const [menuState, setMenuState] = useState({
    isOpen: false,
    position: {},
    message: null,
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const [selectedMimeType, setSelectedMimeType] = useState("");

  const [deletedIds, setDeletedIds] = useState(new Set());

  // Reset local state when switching groups
  useEffect(() => {
    setLocalMessages([]);
    setDeletedIds(new Set());
  }, [activeChat?.id]);

  useEffect(() => {
    // Merge incoming messages with local state to preserve optimistic attachments
    setLocalMessages((prev) => {
      const incoming = (echoMessages || []).map((msg) => ({
        ...msg,
        reactions: msg.reactions || [],
      })).filter((m) => !deletedIds.has(m.id));

      // If server sent no messages, return empty (new group with no chats)
      if (incoming.length === 0) {
        return [];
      }

      // Map by id for quick lookup
      const incomingById = new Map(incoming.map((m) => [m.id, m]));

      // Start with incoming, merging data from prev where needed
      const merged = incoming.map((inc) => {
        const existing = prev.find((p) => p.id === inc.id);
        if (!existing) return inc;
        return {
          ...inc,
          file: inc.file || existing.file || null,
          voice_note: inc.voice_note || existing.voice_note || null,
          user: inc.user || existing.user || null,
          status: inc.status || existing.status || undefined,
        };
      });

      // Append only optimistic messages for this chat (ids starting with temp-)
      prev.forEach((p) => {
        const isTemp = typeof p.id === "string" && p.id.startsWith("temp-");
        const sameChat = String(p.group_id) === String(activeChat?.id);
        if (isTemp && sameChat && !incomingById.has(p.id) && !deletedIds.has(p.id)) {
          merged.push(p);
        }
      });

      return merged;
    });
  }, [echoMessages, deletedIds]);

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
    const payload = {
      message: message.trim(),
      replying_to_id: replyingTo ? replyingTo.id : null,
    };
    setMessage("");
    setReplyingTo(null);
    setSending(true);
    try {
      await onSendMessage(payload);
    } catch (error) {
      toast.error("Failed to send message");
      setMessage(payload.message);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (files, type) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Enforce 10.2MB max file size
    const MAX_BYTES = Math.floor(10 * 1024 * 1024); // ~10 MiB
    if (file.size > MAX_BYTES) {
      toast.error("File too large. Max size is 10MB.");
      return;
    }

    setIsUploading(true);
    // Create local preview and optimistic message
    const objectUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      group_id: activeChat.id,
      user_id: user?.id,
      message: file.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: user?.id,
        first_name: user?.first_name,
        last_name: user?.last_name,
        avatar_url: user?.avatar_url,
      },
      file: {
        id: null,
        user_id: user?.id,
        original_name: file.name,
        path: objectUrl, // blob URL for immediate preview
        mime_type: file.type,
        size: file.size,
        created_at: null,
        updated_at: null,
      },
      status: "uploading",
    };
    setLocalMessages((prev) => [...prev, optimisticMessage]);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("group_id", activeChat.id);
    formData.append("message", file.name);

    try {
      const res = await chatAPI.uploadFile(formData);
      const serverMessage = res?.chat;
      if (serverMessage && serverMessage.id) {
        // Replace optimistic with server message without waiting for realtime update
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === tempId ? serverMessage : m))
        );
      }
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error?.response?.status === 413) {
        toast.error("File too large. Max size is 10.2MB.");
      } else {
        toast.error(error.response?.data?.message || "Failed to upload file.");
      }
      // Remove optimistic message on failure
      setLocalMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsUploading(false);
      try {
        URL.revokeObjectURL(objectUrl);
      } catch (_) { }
    }
  };

  const handleCallButtonClick = async () => {
    if (!activeChat?.id) return;

    if (activeCallInfo?.isActive) {
      // --- Join existing call ---
      setIsJoiningCall(true);
      const joinUrl =
        user?.id &&
          activeCallInfo.startedBy &&
          String(user.id) === String(activeCallInfo.startedBy.id)
          ? activeCallInfo.hostUrl // Use host if current user started the call
          : activeCallInfo.roomUrl; // Otherwise use the guest URL

      if (!joinUrl) {
        toast.error("Could not get the URL to join the call.");
        setIsJoiningCall(false);
        return;
      }

      setCallUrl(joinUrl); // Set the URL from Pusher event data
      setIsCallActive(true);
      setIsJoiningCall(false); // Hide loader
    } else {
      // --- Start a new call ---
      if (isStartingCall) return; // Prevent double-clicks
      setIsStartingCall(true);
      setCallUrl(null);

      try {
        const response = await studyGroupAPI.startCallSession(activeChat.id);
        const hostUrl = response?.host_url;

        if (hostUrl) {
          setCallUrl(hostUrl);
          setIsCallActive(true);
        } else {
          throw new Error(
            "Meeting URL (host_url) was not provided by the server."
          );
        }
      } catch (error) {
        console.error("Failed to start Whereby call session:", error);
        toast.error(
          error.response?.data?.message || "Could not start the call."
        );
        setIsCallActive(false);
        setCallUrl(null);
      } finally {
        setIsStartingCall(false);
      }
    }
  };

  // ✨ handleEndCall now also resets joining state
  const handleEndCall = () => {
    setIsCallActive(false);
    setCallUrl(null);
    setIsJoiningCall(false);
  };

  // ✨ Effect to automatically close call dialog if Pusher says call ended
  useEffect(() => {
    if (!activeCallInfo?.isActive && isCallActive) {
      toast.info("The call has ended.");
      handleEndCall(); // Close the local dialog
    }
  }, [activeCallInfo?.isActive, isCallActive]); // Depend on both states

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
        if (!activeChat || !activeChat.id) {
          toast.error("Cannot delete message: No active chat selected.");
          return;
        }

        try {
          await chatAPI.deleteMessage(activeChat.id, message.id);
          toast.success("Message deleted");
          setLocalMessages((prev) => prev.filter((m) => m.id !== message.id));
          setDeletedIds((prev) => new Set(prev).add(message.id));
        } catch (error) {
          console.error("Error deleting message:", error);
          toast.error(
            error.response?.data?.message || "Failed to delete message."
          );
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
          const existingReaction = msg.reactions.find(
            (r) => r.user === user.first_name
          );
          if (existingReaction) {
            // User is changing their reaction
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.user === user.first_name ? { ...r, emoji } : r
              ),
            };
          } else {
            // User is adding a new reaction
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, user: user.first_name }],
            };
          }
        }
        return msg;
      })
    );
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Audio recording is not supported by your browser.");
      return;
    }

    const mimeTypes = [
      "audio/ogg; codecs=opus",
      "audio/wav",
      "audio/mp3",
      "audio/ogg", // Try generic ogg
      "audio/webm; codecs=opus", // Fallback to webm
    ];

    let supportedMimeType = "";
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        supportedMimeType = type;
        break;
      }
    }

    if (!supportedMimeType) {
      toast.error(
        "No supported audio format found (ogg, wav, mp3). Cannot record."
      );
      console.warn("Supported types check failed for required types:", [
        "audio/ogg; codecs=opus",
        "audio/wav",
        "audio/mp3",
      ]);
      console.warn("Also checked fallbacks:", [
        "audio/ogg",
        "audio/webm; codecs=opus",
      ]);
      return;
    }
    console.log("Using MIME type:", supportedMimeType);
    setSelectedMimeType(supportedMimeType);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: supportedMimeType };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = sendRecording; // Call sendRecording when stopped

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setRecordingTime(0);

      // Start timer interval
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // This will trigger onstop -> sendRecording
      // Stop stream tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      // Clear timer interval
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;

      if (cancel) {
        // If cancelling, reset state immediately without sending
        setIsRecording(false);
        setRecordingStartTime(null);
        setRecordingTime(0);
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        console.log("Recording cancelled");
      }
      // If not cancelling, the `sendRecording` function (called by onstop) will reset state
    }
  };

  const sendRecording = async () => {
    // Check if there are audio chunks to send
    if (audioChunksRef.current.length === 0) {
      console.log("No audio data recorded, not sending.");
      // Reset state even if nothing was recorded/sent
      setIsRecording(false);
      setRecordingStartTime(null);
      setRecordingTime(0);
      mediaRecorderRef.current = null; // Clean up recorder ref
      return;
    }

    let fileExtension = "ogg"; // Default
    if (selectedMimeType.includes("wav")) {
      fileExtension = "wav";
    } else if (selectedMimeType.includes("mp3")) {
      fileExtension = "mp3";
    }

    // ✨ Create Blob with the correct MIME type
    const audioBlob = new Blob(audioChunksRef.current, {
      type: selectedMimeType,
    });
    const fileName = `voicenote_${Date.now()}.${fileExtension}`;
    const formData = new FormData();
    formData.append("voice_note", audioBlob, fileName);

    setIsUploading(true); // Use isUploading state to show loading
    setIsRecording(false); // Recording has stopped
    setRecordingStartTime(null);
    setRecordingTime(0);

    // Optimistic local message for immediate preview
    const objectUrl = URL.createObjectURL(audioBlob);
    const tempId = `temp-voice-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      group_id: activeChat.id,
      user_id: user?.id,
      message: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: user?.id,
        first_name: user?.first_name,
        last_name: user?.last_name,
        avatar_url: user?.avatar_url,
      },
      voice_note: objectUrl, // absolute blob URL for preview
      status: "uploading",
    };
    setLocalMessages((prev) => [...prev, optimisticMessage]);

    audioChunksRef.current = [];
    mediaRecorderRef.current = null; // Clean up recorder ref

    try {
      const res = await chatAPI.sendVoiceNote(activeChat.id, formData);
      const serverMessage = res?.chat || res?.data; // API returns { data: {...} }
      if (serverMessage && serverMessage.id) {
        // Replace optimistic with server message, preserving local voice_note if missing
        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...serverMessage,
                  voice_note: serverMessage.voice_note || m.voice_note || "",
                }
              : m
          )
        );
      }
      toast.success("Voice note sent!");
    } catch (error) {
      console.error("Error sending voice note:", error);
      toast.error(
        error.response?.data?.message || "Failed to send voice note."
      );
      // Remove optimistic message on failure
      setLocalMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsUploading(false);
      try { URL.revokeObjectURL(objectUrl); } catch (_) {}
    }
  };

  // Format recording time (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
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

  const filteredMessages = localMessages.filter((msg) =>
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
        isCallActive={activeCallInfo?.isActive} // ✨ Pass call status to header
        isLoadingCallAction={isStartingCall || isJoiningCall}
        onShowParticipants={() => setShowParticipantsPopup(true)}
        onToggleSearch={() => setIsSearching((prev) => !prev)}
        onShowActions={() => setShowActionsPopup(true)}
        onCallButtonClick={handleCallButtonClick}
      />

      {/* ✨ Call in Progress Banner */}
      {activeCallInfo?.isActive &&
        !isCallActive && ( // Show banner only if call is active but user hasn't joined
          <div className="bg-green-100 border-b border-green-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-700 animate-pulse" />
              <span className="text-sm font-medium text-green-800">
                Call in progress...
                {/* Optional: Add who started it */}
                {/* {activeCallInfo.startedBy && ` (started by ${activeCallInfo.startedBy})`} */}
              </span>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
              onClick={handleCallButtonClick} // Button now acts as "Join"
              disabled={isJoiningCall}
            >
              {isJoiningCall ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Join Call
            </Button>
          </div>
        )}

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
                    className={`group flex items-start gap-2 ${isOwn ? "justify-end" : "justify-start"
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
                      className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"
                        }`}
                    >
                      <div className="relative">
                        <div
                          className={`shadow-sm rounded-lg ${isOwn
                              ? "bg-orange-light text-black-normal rounded-br-none"
                              : "bg-white text-black-normal rounded-bl-none"
                            }`}
                        >
                          {!isOwn && (
                            <p className="text-xs text-orange-normal mb-1 font-medium px-4 pt-2">
                              {msg.user.first_name}
                            </p>
                          )}
                          <MessageContent
                            msg={msg}
                            allMessages={localMessages}
                          />
                          <div className="px-4 pb-1.5 -mt-1 flex justify-end items-center gap-1">
                            <span className="text-[10px] text-gray-500">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
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
            {!isRecording ? (
              <>
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
                      onClick={startRecording}
                      disabled={sending || isUploading}
                      aria-label="Record voice note"
                    >
                      <Mic className="w-5 h-5" />
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
              </>
            ) : (
              // Show recording UI if recording
              <div className="flex-1 flex items-center justify-between bg-gray-100 rounded-full px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-100 w-8 h-8"
                  onClick={() => stopRecording(true)} // Pass true to cancel
                  aria-label="Cancel recording"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
                <div className="flex items-center text-sm">
                  <Mic className="w-5 h-5 text-red-500 mr-2 animate-pulse" />{" "}
                  {/* Pulsing mic */}
                  <span>{formatTime(recordingTime)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-500 hover:bg-green-100 w-8 h-8"
                  onClick={() => stopRecording(false)} // Pass false to send
                  aria-label="Send recording"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </Button>
              </div>
            )}
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
        <DialogContent className="max-w-full w-full h-[80vh] md:h-[90vh] p-0 gap-0 border-0">
          {isStartingCall || isJoiningCall ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">
                {isStartingCall ? "Starting call..." : "Joining call..."}
              </span>
            </div>
          ) : (
            callUrl && (
              <WherebyCall
                roomUrl={callUrl}
                onCallEnd={handleEndCall}
                userDisplayName={`${user.first_name} ${user.last_name}`}
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
