import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { chatAPI, API_STORAGE_URL } from "@/lib/api";
import { useInView } from "react-intersection-observer";

const LazyImage = ({ item }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });

  const fileUrl = `${API_STORAGE_URL}/${item.file.path}`;

  return (
    <a
      ref={ref}
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="aspect-square bg-gray-100 rounded-md block"
    >
      {inView ? (
        <img
          src={fileUrl}
          alt={item.file.original_name}
          className="w-full h-full object-cover rounded-md hover:opacity-80 transition-opacity"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-300" />
        </div>
      )}
    </a>
  );
};

const MediaTab = ({ groupId }) => {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const response = await chatAPI.getFiles(groupId);
        const allFiles = response?.data || [];
        // Filter for images and videos
        const mediaFiles = allFiles.filter(
          (item) =>
            item.file &&
            (item.file.mime_type?.startsWith("image/") ||
              item.file.mime_type?.startsWith("video/"))
        );
        setMedia(mediaFiles);
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedia();
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
      {media.length === 0 ? (
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No media found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Photos and videos shared in this chat will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item) => (
            <LazyImage key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaTab;
