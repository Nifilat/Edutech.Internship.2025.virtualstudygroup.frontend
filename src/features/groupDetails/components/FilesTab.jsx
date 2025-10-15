import React, { useState, useEffect } from "react";
import { File as FileIcon, Loader2 } from "lucide-react";
import { chatAPI } from "@/lib/api";
import { useFileDownloader } from "@/hooks/useFileDownloader";

const FileExtensionIcon = ({ fileName }) => {
  const extension = fileName?.split(".").pop()?.toUpperCase() || "FILE";
  return (
    <div className="w-10 h-10 flex-shrink-0 rounded-md bg-gray-200 flex flex-col items-center justify-center">
      <FileIcon className="w-4 h-4 text-gray-500" />
      <span className="text-[9px] font-bold text-gray-600 mt-0.5">
        {extension.substring(0, 4)}
      </span>
    </div>
  );
};

const FilesTab = ({ groupId }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { download, isDownloading } = useFileDownloader();

  useEffect(() => {
    if (!groupId) return;
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const response = await chatAPI.getFiles(groupId);
        const allFiles = response?.data || [];
        // Exclude images and videos, which are shown in the Media tab
        const documentFiles = allFiles.filter(
          (item) =>
            item.file &&
            !item.file.mime_type?.startsWith("image/") &&
            !item.file.mime_type?.startsWith("video/")
        );
        setFiles(documentFiles);
      } catch (error) {
        console.error("Failed to fetch files:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-orange-normal" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {files.length === 0 ? (
        <div className="text-center">
          <FileIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No saved files</h3>
          <p className="mt-1 text-sm text-gray-500">
            Documents and files shared in this chat will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => download(item.file.id, item.file.original_name)}
            >
              <FileExtensionIcon fileName={item.file.original_name} />
              <div className="flex-1 min-w-0 ml-4">
                <p className="text-sm font-medium text-black truncate">
                  {item.file.original_name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              {isDownloading === item.file.id && (
                <Loader2 className="w-5 h-5 animate-spin text-orange-normal ml-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesTab;
