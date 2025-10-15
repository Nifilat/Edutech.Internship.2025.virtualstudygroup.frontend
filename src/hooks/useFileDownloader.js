import { useState } from "react";
import { chatAPI } from "@/lib/api";
import { toast } from "sonner";

export const useFileDownloader = () => {
  const [isDownloading, setIsDownloading] = useState(null); // Will hold the ID of the file being downloaded

  const download = async (fileId, fileName) => {
    if (isDownloading) return;
    setIsDownloading(fileId);
    try {
      const blob = await chatAPI.downloadFile(fileId);

      // Create a temporary link to trigger the download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file.");
    } finally {
      setIsDownloading(null);
    }
  };

  return { download, isDownloading };
};
