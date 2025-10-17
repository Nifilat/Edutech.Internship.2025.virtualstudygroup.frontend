import React from "react";
import { X } from "lucide-react";

export const ReplyPreview = ({ message, onCancel }) => {
  if (!message) return null;

  return (
    <div className="p-2 bg-gray-100 border-t border-b border-gray-200 flex items-center gap-3">
      <div className="w-1 bg-orange-normal self-stretch rounded-full"></div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-orange-normal text-sm">
          {message.user.first_name}
        </p>
        <p className="text-sm text-gray-600 truncate">
          {message.message || "Attachment"}
        </p>
      </div>
      <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
