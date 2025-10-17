import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { chatAPI } from "@/lib/api";

// This regex finds URLs in a string.
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const LinksTab = ({ groupId }) => {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const fetchLinks = async () => {
      setIsLoading(true);
      try {
        // We fetch all messages to parse them for links.
        const allMessages = await chatAPI.getMessages(groupId);

        const messagesWithLinks = (allMessages || [])
          .map((msg) => ({
            ...msg,
            // Find all links in the message
            foundLinks: msg.message?.match(URL_REGEX) || [],
          }))
          .filter((msg) => msg.foundLinks.length > 0);

        setLinks(messagesWithLinks);
      } catch (error) {
        console.error("Failed to fetch links:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
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
      {links.length === 0 ? (
        <div className="text-center">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No links found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Links shared in this chat will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((msg) => (
            <div key={msg.id}>
              {msg.foundLinks.map((link, index) => (
                <a
                  key={`${msg.id}-${index}`}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="p-2 bg-gray-200 rounded-md mr-4">
                    <LinkIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {link}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sent on {new Date(msg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinksTab;
