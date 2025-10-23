import React, { useState, useRef } from "react";
import { useFileDownloader } from "@/hooks/useFileDownloader";
import { API_STORAGE_URL } from "@/lib/api";
import {
  File as FileIcon,
  Download,
  PlayCircle,
  Loader2,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Helper function to format time (MM:SS)
const formatAudioTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

// Custom Audio Player Component (can be defined inside FileMessage or separately)
const VoiceNotePlayer = ({ msg, fileUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const { getUser } = useAuth();
  const currentUser = getUser();
  const isOwn = msg.user_id === currentUser?.id;

  // Handle loading metadata to get duration
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle time updates during playback
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle audio ending
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0); // Reset time when finished
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((error) => console.error("Audio play failed:", error)); // Add error handling
    }
    setIsPlaying(!isPlaying);
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Get user initials
  const userInitials = msg.user?.first_name?.[0] || "U";

  return (
    <div
      className={`flex items-center gap-4 px-4 py-2 w-full  rounded-lg ${
        isOwn ? "" : ""
      }`}
    >
      <audio
        ref={audioRef}
        src={fileUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        preload="metadata"
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        className={`w-10 h-10 rounded-full flex-shrink-0 ${
          isOwn
            ? "bg-orange-100 hover:bg-orange-200"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-orange-normal" />
        ) : (
          <Play className="w-5 h-5 text-orange-normal fill-orange-normal" />
        )}
      </Button>
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <Progress value={progressPercentage} className="h-1.5 w-full mb-1.5" />
        <span className="text-[11px] text-gray-500 self-end">
          {formatAudioTime(isPlaying ? currentTime : duration)}
        </span>
      </div>
    </div>
  );
};

export const FileMessage = ({ msg }) => {
  const { download, isDownloading } = useFileDownloader();

  if (msg.voice_note) {
    const voiceNoteUrl = `${API_STORAGE_URL}/${msg.voice_note}`;
    return <VoiceNotePlayer msg={msg} fileUrl={voiceNoteUrl} />;
  }

  if (!msg.file) return null;

  const isImage = msg.file.mime_type?.startsWith("image/");
  const isVideo = msg.file.mime_type?.startsWith("video/");
  const isAudio = msg.file.mime_type?.startsWith("audio/");
  const isPDF = msg.file.mime_type === "application/pdf";
  const fileUrl = `${API_STORAGE_URL}/${msg.file.path}`;

  const handleDownloadClick = (e) => {
    e.stopPropagation(); // Prevent triggering other click events
    download(msg.file.id, msg.file.original_name);
  };

  const fileSize = msg.file.size
    ? `${Math.round(msg.file.size / 1024)} KB`
    : "";

  // RENDER IMAGE
  if (isImage) {
    return (
      <div
        className="relative w-full max-w-[280px] cursor-pointer"
        onClick={() => window.open(fileUrl, "_blank")}
      >
        <img
          src={fileUrl}
          alt={msg.message || "Uploaded image"}
          className="rounded-t-lg w-full h-auto object-cover"
        />
        {msg.message && <p className="text-sm p-2">{msg.message}</p>}
        {isDownloading === msg.file.id && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>
    );
  }

  // RENDER VIDEO
  if (isVideo) {
    return (
      <div
        className="relative w-full max-w-[280px] bg-black rounded-t-lg cursor-pointer"
        onClick={() => window.open(fileUrl, "_blank")}
      >
        <video
          src={fileUrl}
          className="opacity-50 w-full h-auto object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <PlayCircle className="w-12 h-12" />
        </div>
        {msg.message && (
          <p className="text-sm p-2 bg-gray-800/50 w-full rounded-b-lg text-white">
            {msg.message}
          </p>
        )}
      </div>
    );
  }

  // ✨ RENDER AUDIO (VOICE NOTE)
  if (isAudio) {
    return (
      <div className="flex items-center gap-2 p-2 w-full max-w-[280px]">
        <audio controls src={fileUrl} className="w-full h-10">
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // RENDER PDF
  if (isPDF) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-200/50 rounded-t-lg">
        <div className="flex items-center justify-center p-3 rounded-md bg-white">
          <FileIcon className="w-8 h-8 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm break-all truncate">
            {msg.file.original_name}
          </p>
          <p className="text-xs text-gray-500">{fileSize} · PDF</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownloadClick}
          disabled={isDownloading === msg.file.id}
        >
          {isDownloading === msg.file.id ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-gray-500" />
          )}
        </Button>
      </div>
    );
  }

  // RENDER OTHER FILES
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="flex items-center justify-center p-3 rounded-full bg-gray-200">
        <FileIcon className="w-6 h-6 text-gray-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm break-all truncate">
          {msg.file.original_name}
        </p>
        <p className="text-xs text-gray-500">{fileSize}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownloadClick}
        disabled={isDownloading === msg.file.id}
      >
        {isDownloading === msg.file.id ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5 text-gray-500" />
        )}
      </Button>
    </div>
  );
};
