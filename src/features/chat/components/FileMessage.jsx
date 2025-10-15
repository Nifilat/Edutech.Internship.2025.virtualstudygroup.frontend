import React from "react";
import { useFileDownloader } from "@/hooks/useFileDownloader";
import { API_STORAGE_URL } from "@/lib/api";
import { File as FileIcon, Download, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FileMessage = ({ msg }) => {
  const { download, isDownloading } = useFileDownloader();

  if (!msg.file) return null;

  const isImage = msg.file.mime_type?.startsWith("image/");
  const isVideo = msg.file.mime_type?.startsWith("video/");
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
